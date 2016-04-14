var Benchmark = require('benchmark')
var _get = require('lodash.get')
var objectResolvePath = require('./object-resolve-path')
var suite = new Benchmark.Suite

var testObj = {
  a: 'b',
  'hyph"en': 10,
  'hy[ph]en': 11,
  b: {
    c: [1, 2, 3],
    d: ['h', 'ch'],
    e: [{}, {f: 'g'}],
    f: 'i'
  }
}

// add tests
suite.add('lodash.get', function () {
  _get(testObj, 'b["e"][1].f')
})
  .add('object-resolve-path', function () {
    objectResolvePath(testObj, 'b["e"][1].f')
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run({ 'async': true })
