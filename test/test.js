const Observable = require('../src/index')

const obj = {a:1, b: {name: 'qtx', value: 1}}
const o1 = Observable.from(obj, true)

console.log('o1', o1)

console.log('o1 === obj: ' + (o1.b === obj.b))

o1.watch('a', function(newVal, oldVal) {
    console.log('a changed :' + newVal + ',' + oldVal)
})

o1.watch('b.name', function(newVal, oldVal) {
    console.log('b.name changed :' + newVal + ',' + oldVal)
})

o1.a = '10'
// unwatch()
o1.b.name = 'lily'

obj.b.name = 'aaa' // no change