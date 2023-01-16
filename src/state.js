import {observe} from "./observe/index";

export function initState(vm) {
    const opts = vm.$options //获取所有的选项
    if (opts.data) {
        initData(vm)
    }
}

function proxy(vm, target, key) {
Object.defineProperty(vm,key,{//vm.name
    get(){
        return vm[target][key]  //vm._data.name
    },
    set(newValue){
        vm[target][key] = newValue
    }
})
}

function initData(vm) {
    let data = vm.$options.data //data可能是函数或者对象
    data = typeof data === "function" ? data.call(vm) : data  //data是用户返回的对象

    vm._data = data//我将返回的对象放到了_data上
    //对数据进行劫持 vue2里采用了一个api  Object.defineProperty
    observe(data)


    //将vm._data用vm来代理  把 vm._data.name -> vm.name
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}