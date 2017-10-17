class Watcher {
    constructor () {
        this._watchers = {}
    }

    watch (watchName, handler) {
        if (!watchName) {
            return
        }

        const watchers = this._watchers
        const handlers = watchers[watchName] || (watchers[watchName] = [])
        if (!~handlers.indexOf(handler)) {
            handlers.push(handler)
        }

        return function() { // unwatch
            for (let i = 0, len = handlers.length; i < len; i++) {
                if (handler === handlers[i]) {
                    handlers.splice(i, 1)
                    break;
                }
            }
        }
    }

    notify (watchName, newVal, oldVal) {
        const watchers = this._watchers
        const handlers = watchers[watchName]
        if (!handlers) {
            return
        }

        handlers.forEach(handler => {
            handler(newVal, oldVal)
        })
    }
}

module.exports = Watcher