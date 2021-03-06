/* @flow */

import VNode, { createTextVNode } from 'core/vdom/vnode'
import { isFalse, isTrue, isDef, isUndef, isPrimitive } from 'shared/util'

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 在编译时静态分析模板,模板编译器试图最小化对归一化的需求
// 对于纯html标记,归一化完全可以跳过,因为
// 生成的渲染render函数保证返回Vnode数组. 有2中情况需要额外的处理:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.

// 1. 当children孩子包含组件时, 因为一个函数式组件可以返回一个数组而不是一个根节点.
// 在这种情况下,只需要简单地归一化 - 如果任意孩子是一个数组, 我们通过 Array.prototype.concat 方法
// 把整个 children 数组打平，让它的深度只有一层,
// 因为函数式组件已经归一化它自己的孩子了.
export function simpleNormalizeChildren (children: any) {
    for (let i = 0; i < children.length; i++) {
        if (Array.isArray(children[i])) {
            return Array.prototype.concat.apply([], children)
        }
    }
    return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.

// 2. 当children孩子包含总是生成嵌套数组结构时,
// 比如: 模板, 插槽, 循环指令, 或者是由用户手写的render函数/jsx提供给children孩子.
// 在这些情况下需要完全的归一化来迎合所有可能的孩子值.
export function normalizeChildren (children: any): ?Array<VNode> {
    return isPrimitive(children)
        ? [createTextVNode(children)]
        : Array.isArray(children)
            ? normalizeArrayChildren(children)
            : undefined
}

function isTextNode (node): boolean {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
    const res = []
    let i, c, lastIndex, last
    for (i = 0; i < children.length; i++) {
        c = children[i]
        if (isUndef(c) || typeof c === 'boolean') continue
        lastIndex = res.length - 1
        last = res[lastIndex]
        //  nested
        if (Array.isArray(c)) {
            if (c.length > 0) {
                c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
                // merge adjacent text nodes
                if (isTextNode(c[0]) && isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
                    c.shift()
                }
                res.push.apply(res, c)
            }
        } else if (isPrimitive(c)) {
            if (isTextNode(last)) {
                // merge adjacent text nodes
                // this is necessary for SSR hydration because text nodes are
                // essentially merged when rendered to HTML strings
                res[lastIndex] = createTextVNode(last.text + c)
            } else if (c !== '') {
                // convert primitive to vnode
                res.push(createTextVNode(c))
            }
        } else {
            if (isTextNode(c) && isTextNode(last)) {
                // merge adjacent text nodes
                res[lastIndex] = createTextVNode(last.text + c.text)
            } else {
                // default key for nested array children (likely generated by v-for)
                if (
                    isTrue(children._isVList) &&
                    isDef(c.tag) &&
                    isUndef(c.key) &&
                    isDef(nestedIndex)
                ) {
                    c.key = `__vlist${nestedIndex}_${i}__`
                }
                res.push(c)
            }
        }
    }
    return res
}
