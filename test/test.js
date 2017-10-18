const Observable = require('../src/index')

const obj = {a:1, b: {name: 'qtx', value: 1}}

const o1 = Observable.from(obj, true)

console.log('o1 === obj: ' + (o1.b === obj.b))

o1.watch('a', function(newVal, oldVal) {
    console.log('a changed :', newVal, oldVal)
})

o1.watch('b', function(newVal, oldVal) {
    console.log('b changed :', JSON.stringify(newVal), JSON.stringify(oldVal))
})

o1.a = '10'
// unwatch()
o1.b.name = 'lily'

obj.b.name = 'aaa' // no change