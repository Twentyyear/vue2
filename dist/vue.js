(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function initState(vm) {
      var opts = vm.$options; //获取所有的选项
      if (opts.data) {
        initData(vm);
      }
    }
    function initData(vm) {
      var data = vm.$options.data; //data可能是函数或者对象
      data = typeof data === "function" ? data.call(vm) : data;
    }

    function initMixin(Vue) {
      //就是给Vue增加init方法
      Vue.prototype._init = function (options) {
        //用于初始化操作
        //vue vm.$options 就是获取用户配置
        //如果这里没有挂载在实例上 那么在下面的 Vue.prototype 的其他方法上就无法获取options了
        //这里用this有点恶心 需要保存一下this
        var vm = this;
        vm.$options = options; //将用户的选项挂载到实例上

        //初始化状态
        initState(vm);
      };
    }

    function Vue(options) {
      //option 就是用户的选项了
      this._init(options); //默认就调用了init
    }

    initMixin(Vue); //拓展了init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
