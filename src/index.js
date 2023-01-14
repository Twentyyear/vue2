import {initMixin} from "./init";

function Vue(options) { //option 就是用户的选项了
    this._init(options)//默认就调用了init
}

initMixin(Vue) //拓展了init方法
export default Vue