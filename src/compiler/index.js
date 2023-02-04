const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)    //他匹配到的分组 是一个标签名 ----->   <div>  or  <div:xxx> (这个叫命名空间)
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)  //匹配的是结束标签  </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/   //匹配属性
const startTagClose = /^\s*(\/?)>/    //匹配 <div>  <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g   //匹配 {{ abcdedsasd }}

//vue3 不是使用正则
//对模板进行编译处理
function parseHTML(html) { //html开始肯定是一个 <
    function advance(n) {
        html = html.substring(n)  //匹配到开始标签后 要截取掉匹配的标签
    }

    const ELEMENT_TYPE = 1 //元素类型 1
    const TEXT_TYPE = 3 //文本类型 3
    const stack = [] //栈 用于存放元素的
    let currentParent //永远指向栈中的最后一个
    let root

    //最终需要转化成一棵语法树
    function creatASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs) {
        let node = creatASTElement(tag, attrs) //创建一个ast节点
        if (!root) { //看一下是否为空树
            root = node //如果为空则表示当前节点是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)//存入栈中
        currentParent = node //currentParent 为栈中最后一个
        // console.log(tag,attrs,'开始')
    }

    function chars(text) {//文本直接放到当前指向的节点中
        text = text.replace(/\s/g,'')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
        // console.log(text,'文本')
    }

    function end() {
        let node = stack.pop() //弹出最后一个,校验标签是否合法
        currentParent = stack[stack.length - 1]
    }

    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], //标签名
                attrs: [], //属性
            }
            advance(start[0].length)
            //如果不是开始标签结束 就一直匹配下去
            // <div id = 'app'>
            // id = 'app'>
            let attr, end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5] || true})
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false //不是开始标签
    }

    while (html) {
        //如果textEnd 为0 说明是一个开始标签的或者结束标签
        //如果 textEnd > 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<') //如果indexOf中的索引是0 则说明是个标签
        if (textEnd === 0) {
            const startTagMatch = parseStartTag() //开始标签的匹配结果
            if (startTagMatch) { //解析到开始标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd)   //文本内容
            if (text) {
                chars(text)
                advance(text.length) //解析到的文本
            }
        }
    }
    console.log(root);
}

export function compileToFunction(template) {
    // 1.就是将template 转化成ast语法树
    let ast = parseHTML(template)
    //2.生成render方法 (render方法执行后返回的结果就是 虚拟DOM)
}