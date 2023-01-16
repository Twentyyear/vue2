//我们希望重写数组中的部分方法

let oldArrayProto = Array.prototype; //获取数组的原型

// Array.prototype.push = function () {}  这样写就直接给原来的push功能干掉了 不合理
export let newArrayProto = Object.create(oldArrayProto);//所以我们在这里拷贝一份出来
let methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'] //找到所有的变异方法 即会修改原数组的方法   concat slice 都不会修改原来的数组
methods.forEach(method => {
    //arr.push(1,2,3)
    newArrayProto[method] = function (...args) { //这里重写了数组的方法
        //push()
        //内部调用了原来的方法, 函数的劫持
        const result = oldArrayProto[method].call(this, ...args)
        //这里需要对新增的数据再次进行劫持
        let inserted;
        let ob = this.__ob__ //这里拿到实例 在下面用
        switch (methods) {
            case 'push':
            case 'unshift': //arr.unshift(1,2,3)
                inserted = args
                break;
            case 'splice': //arr.splice(0,1,{a:1},{a:1})
                inserted = args.splice(2)
            default:
                break;
        }
        // console.log(inserted)//新增的内容
        if (inserted) {
            //对新增的内容再次进行观测   但是这里拿不到observeArray 方法 所以 通过    data.__ob__ = this 把实例挂载上去
            ob.observeArray(inserted)
        }
        return result
    }
})