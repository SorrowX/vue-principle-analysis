/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
    const el = query(id)
    return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
): Component {
    el = el && query(el) // 获取到dom

    /* istanbul ignore if */
    if (el === document.body || el === document.documentElement) { // el dom 不能为body和html元素
        process.env.NODE_ENV !== 'production' && warn(
            `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
        )
        return this
    }

    const options = this.$options
    // resolve template/el and convert to render function 把el转成template,把template转成render渲染函数
    if (!options.render) { // 选项没有render属性的话
        let template = options.template // 则找template属性
        if (template) {
            if (typeof template === 'string') { // 使用 X-Templates 的情况
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template) // 使用el的 innerHTML 作为模板
                    /* istanbul ignore if */
                    if (process.env.NODE_ENV !== 'production' && !template) { // 非生产环境且没有模板的话,则提示如下
                        warn(
                            `Template element not found or is empty: ${options.template}`,
                            this
                        )
                    }
                }
            } else if (template.nodeType) { // 如果 template 是 dom 的话，则使用dom的innerHTML 作为 模板
                template = template.innerHTML
            } else { // 如上都不行的话,提示失效的template选项
                if (process.env.NODE_ENV !== 'production') {
                    warn('invalid template option:' + template, this)
                }
                return this
            }
        } else if (el) { // 如果没有定义template模板,怎使用el dom 的 outerHTML 作为tempalte 模板
            template = getOuterHTML(el)
        }
        if (template) { // 拿到模板后
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                mark('compile')
            }

            // 生成render函数和静态渲染函数,且赋值给我们的vm.$options对象
            const { render, staticRenderFns } = compileToFunctions(template, {
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns

            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                mark('compile end')
                measure(`vue ${this._name} compile`, 'compile', 'compile end')
            }
        }
    }
    return mount.call(this, el, hydrating) // 调用先前存好的mount方法,这么做是因为runtime only版本的vue.js直接调用mount函数,而不会执行这个函数上面的那些语句,是为了代码复用
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
    if (el.outerHTML) {
        return el.outerHTML
    } else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

Vue.compile = compileToFunctions

export default Vue
