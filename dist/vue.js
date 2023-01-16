(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  //我们希望重写数组中的部分方法

  var oldArrayProto = Array.prototype; //获取数组的原型

  // Array.prototype.push = function () {}  这样写就直接给原来的push功能干掉了 不合理
  var newArrayProto = Object.create(oldArrayProto); //所以我们在这里拷贝一份出来
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; //找到所有的变异方法 即会修改原数组的方法   concat slice 都不会修改原来的数组
  methods.forEach(function (method) {
    //arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //这里重写了数组的方法
      //push()
      //内部调用了原来的方法, 函数的劫持
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      //这里需要对新增的数据再次进行劫持
      var inserted;
      var ob = this.__ob__; //这里拿到实例 在下面用
      switch (methods) {
        case 'push':
        case 'unshift':
          //arr.unshift(1,2,3)
          inserted = args;
          break;
        case 'splice':
          //arr.splice(0,1,{a:1},{a:1})
          inserted = args.splice(2);
      }
      // console.log(inserted)//新增的内容
      if (inserted) {
        //对新增的内容再次进行观测   但是这里拿不到observeArray 方法 所以 通过    data.__ob__ = this 把实例挂载上去
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      //object.defineProperty只能劫持已经存在的属性,后增的,或者删除的 不知道  (所以在vue2里面会单独为此新增一些api 如$set $delete)
      // data.__ob__ = this //给数据加一个标识,如果数据上有__ob__说明这个数据被观测过了  但是这样写会有bug 假如data不是数组是对象 会调用walk方法进入死循环
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //将__ob__变成不可枚举 (循环的时候无法获取到 就不会进入死循环了)
      });

      if (Array.isArray(data)) {
        //这里可以重写数组中的方法 7个变异方法 是可以修改数组本身的
        //需要保留数组原有的特性,并且可以重写部分方法
        data.__proto__ = newArrayProto;
        this.observeArray(data); //如果数组中放放是对象 可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //遍历对象 对属性依次劫持
        //"重新定义"属性,所以vue2的性能瓶颈就在这
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        //观测数组
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  /**
   * 把我们的某个数据定义成响应式
   * @param target 你要定义的是谁
   * @param key 它的key
   * @param value 它的value
   */
  function defineReactive(target, key, value) {
    //闭包 不会销毁 所以get set都可以拿到value
    observe(value); //对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候 会执行get
        console.log('key', key);
        return value;
      },
      set: function set(newValue) {
        //修改的时候 会执行set
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }
  function observe(data) {
    //对这个对象进行劫持
    if (_typeof(data) !== "object" || data === null) {
      return; //只对对象进行劫持
    }

    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }
    //如果一个对象被劫持过了,那就不需要再被劫持了(要判断一个对象是否被劫持过,可以增添一个实例,用实例来判断是否被劫持过)
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options; //获取所有的选项
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      //vm.name
      get: function get() {
        return vm[target][key]; //vm._data.name
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; //data可能是函数或者对象
    data = typeof data === "function" ? data.call(vm) : data; //data是用户返回的对象

    vm._data = data; //我将返回的对象放到了_data上
    //对数据进行劫持 vue2里采用了一个api  Object.defineProperty
    observe(data);

    //将vm._data用vm来代理  把 vm._data.name -> vm.name
    for (var key in data) {
      proxy(vm, '_data', key);
    }
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
    this._init(options); //默认就调用了init 传入用户的选项
  }

  initMixin(Vue); //拓展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
