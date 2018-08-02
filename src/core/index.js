import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

// 给 Vue 添加
// config, util, options, cid 属性
// set, delete, nextTick, use, mixin, extend, component, directive, filter 方法
initGlobalAPI(Vue)

// 给原型添加 $isServer 属性
Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
})

// 给原型添加 $ssrContext 属性
Object.defineProperty(Vue.prototype, '$ssrContext', {
    get () {
	    /* istanbul ignore next */
	    return this.$vnode && this.$vnode.ssrContext
    }
})

// 给 Vue 添加 FunctionalRenderContext 函数
// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
})

// 给 Vue 添加 version 属性
Vue.version = '__VERSION__'

export default Vue
