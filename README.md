# object-resolve-path
a simple utility function for getting a value at a path from an object with all the usecases properly covered.
Based on Path pseodoclass from https://github.com/Polymer/observe-js/blob/7e94bb14d7c44b221af7bcc874cf9898f26747d8/src/observe.js#L305

## Install
```
npm i object-resolve-path
```

## Usage

```javascript
var resolvePath = require('object-resolve-path');
resolvePath(someObject, 'a.b[0]');	//returns first property from b from a from someObject
resolvePath(someObject, 'a["b-a"][0]');	//this works as well, thanks to the parser/statemachine
```

## Typical usecase?
Most other libraries for accessing deeply nested properties of an object don't work with bracket syntax. This one does work with bracket syntax.

For thorough description, check the [tests](https://github.com/capaj/object-resolve-path/blob/master/test/object-resolve-path.spec.js).

### Similar modules:

https://www.npmjs.com/package/lodash.get (works for both but much much slower, doesn't throw when path is not valid, object-resolve-path does)

https://github.com/deoxxa/dotty (works only for dots)

https://github.com/Ntran013/dot-access  (works only for dots)

https://github.com/substack/js-traverse (much more complex and useful)


## Benchmarks

```
node benchmark.js
lodash.get x 2,088,580 ops/sec ±3.42% (74 runs sampled)
object-resolve-path x 26,260,596 ops/sec ±3.39% (85 runs sampled)
Fastest is object-resolve-path
```

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
