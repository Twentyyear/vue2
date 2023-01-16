import {newArrayProto} from "./array";

class Observe {
    constructor(data) {
        //object.defineProperty只能劫持已经存在的属性,后增的,或者删除的 不知道  (所以在vue2里面会单独为此新增一些api 如$set $delete)
        // data.__ob__ = this //给数据加一个标识,如果数据上有__ob__说明这个数据被观测过了  但是这样写会有bug 假如data不是数组是对象 会调用walk方法进入死循环
        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable: false //将__ob__变成不可枚举 (循环的时候无法获取到 就不会进入死循环了)
        })
        if (Array.isArray(data)) {
            //这里可以重写数组中的方法 7个变异方法 是可以修改数组本身的
            //需要保留数组原有的特性,并且可以重写部分方法
            data.__proto__ = newArrayProto
            this.observeArray(data)//如果数组中放放是对象 可以监控到对象的变化
        } else {
            this.walk(data)
        }
    }

    walk(data) { //遍历对象 对属性依次劫持
        //"重新定义"属性,所以vue2的性能瓶颈就在这
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }

    observeArray(data) { //观测数组
        data.forEach(item => observe(item))
    }
}

/**
 * 把我们的某个数据定义成响应式
 * @param target 你要定义的是谁
 * @param key 它的key
 * @param value 它的value
 */
export function defineReactive(target, key, value) { //闭包 不会销毁 所以get set都可以拿到value
    observe(value)//对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
        get() {//取值的时候 会执行get
            console.log('key', key)
            return value
        },
        set(newValue) {//修改的时候 会执行set
            if (newValue === value) return
            observe(newValue)
            value = newValue
        }
    })

}

export function observe(data) {
    //对这个对象进行劫持
    if (typeof data !== "object" || data === null) {
        return //只对对象进行劫持
    }
    if (data.__ob__ instanceof Observe) {
        return data.__ob__
    }
    //如果一个对象被劫持过了,那就不需要再被劫持了(要判断一个对象是否被劫持过,可以增添一个实例,用实例来判断是否被劫持过)
    return new Observe(data)
}