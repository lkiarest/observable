const Observable = require('./observable')

module.exports = {
    /**
     * convert an object to observable instance
     */
    from (obj, clone) {
        return new Observable(obj, clone)
    }
}
