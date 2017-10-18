const Watcher = require('./watcher')

const BASIC_TYPES = ['Null', 'Undefined', 'Number', 'Boolean', 'String', 'RegExp', 'Function'].map(type => {
    return `[object ${type}]`
})

/**
 * check whether a data is of basic type
 */
const basicType = (data) => {
    if (!data) {
        return true
    }

    const typeStr = Object.prototype.toString.call(data)
    return !!~BASIC_TYPES.indexOf(typeStr)
}

/**
 * 深拷贝
 */
const deepClone = (source) => {
    if (!source || (typeof source !== 'object')) {
        return source
    }

    let target = null

    if (Array.isArray(source)) {
        target = [...source.map(item => deepClone(item))]
        return target
    }

    target = Object.create(null)

    Object.keys(source).forEach(key => {
        const val = source[key]
        if (basicType(val)) {
            target[key] = val
        } else if (Array.isArray(val)) {
            const tempArr = target[key] = []
            val.forEach(item => {
                tempArr.push(deepClone(item))
            })
        } else {
            target[key] = deepClone(val)
        }
    })

    Object.setPrototypeOf(target, Object.getPrototypeOf(source))

    return target
}

/**
 * 根据属性路径获取对象的值
 * @param  {Object} obj      待获取对象
 * @param  {String} propName 要获取的属性，支持一级和多级如 'a' / 'a.b'
 */
const getTargetVal = (obj, propName) => {
    const props = propName.split('.') // 拆分数组
    let pRoot = props.shift()
    let lastProp = ''
    let lastValue = null // 有时需要回溯到前一个对象

    while (pRoot) {
        lastProp = pRoot
        lastValue = obj
        obj = obj[pRoot]
        pRoot = props.shift()
    }

    return {
        lastProp,
        lastValue,
        value: obj
    }
}

class Observable {
    /**
     * 构造方法
     * @param  {Object} obj   待观察对象
     * @param  {Boolean} clone 是否克隆一份新的对象使用
     */
    constructor (obj, clone) {
        this._originalObj = obj
        obj = clone ? deepClone(obj) : obj
        this._watchObj = obj
        this._watcher = new Watcher()

        Object.defineProperty(obj, 'watch', {
            value: this.watch.bind(this)
        })

        return obj
    }

    /**
     * 获取原始对象，若 clone 为 false，原始对象会被改变
     */
    original () {
        return this._originalObj
    }

    /**
     * 添加监听事件
     * @param  {String} propName 要监听的属性，支持一级和多级如 'a' / 'a.b'
     * @param  {Function} handler  数据变化的回调处理
     * @return {Function}          取消监听的方法，直接调用即可取消监听
     */
    watch (propName, handler) {
        if (!propName || !handler) {
            return
        }

        const obj = this._watchObj
        this._observe(obj, propName)
        return this._watcher.watch(propName, handler)
    }

    /**
     * 使用 setter/getter 触发监听事件
     */
    _observe (data, propName) {
        const self = this
        const watcher = this._watcher

        const getRealVal = () => {
            return getTargetVal(data, propName).value
        }

        this._walk(data, propName, (obj, prop) => {
            let newVal = obj[prop]

            Object.defineProperty(obj, prop, {
                enumerable: true,
                get () {
                    return newVal
                },
                set (val) {
                    const oldVal = deepClone(getRealVal())
                    newVal = val
                    watcher.notify(propName, getRealVal(), oldVal)
                }
            })
        })
    }

    /**
     * 递归遍历对象属性
     * @param  {Object}   obj      待遍历对象
     * @param  {String} propName   当前遍历的属性，支持一级和多级如 'a' / 'a.b'
     * @param  {Function} callback 遍历到每个属性后执行的处理
     */
    _walk (obj, propName, callback) {
        if (!callback) { // no callback, no task
            return
        }

        const target = getTargetVal(obj, propName)
        const targetVal = target.value

        if (basicType(targetVal)) {
            callback(target.lastValue, target.lastProp)
        } else if (Array.isArray(targetVal)) {
            // TODO: array watch
        } else { // object
            Object.keys(targetVal).forEach(key => {
                this._walk(targetVal, key, callback)
            })
        }
    }
}

module.exports = Observable
