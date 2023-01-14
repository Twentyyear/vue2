import {initState} from "./state";

export function initMixin(Vue) {//就是给Vue增加init方法
    Vue.prototype._init = function (options) {//用于初始化操作
        //vue vm.$options 就是获取用户配置
        //如果这里没有挂载在实例上 那么在下面的 Vue.prototype 的其他方法上就无法获取options了
        //这里用this有点恶心 需要保存一下this
        const vm = this
        vm.$options = options //将用户的选项挂载到实例上

        //初始化状态
        initState(vm)

    }
}

