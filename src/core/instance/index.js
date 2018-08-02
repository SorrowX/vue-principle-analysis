import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
    if (
    	process.env.NODE_ENV !== 'production' &&
        !(this instanceof Vue)
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
}

initMixin(Vue) // 给原型添加 _init 方法
stateMixin(Vue) // 给原型添加 $data, $props属性, $set, $delete, $watch 方法
eventsMixin(Vue) // 给原型添加 $on, $once, $off, $emit 方法
lifecycleMixin(Vue) // 给原型添加 _update, $forceUpdate, $destroy 方法
renderMixin(Vue) // 给原型添加 _o,_n,_s,_l,_t,_q,_i,_m,_f,_k,_b,_v,_e,_u,_g, $nextTick, _render 方法

export default Vue
