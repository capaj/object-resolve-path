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

https://github.com/deoxxa/dotty (works only for dots)

https://github.com/Ntran013/dot-access  (works only for dots)

https://github.com/substack/js-traverse (much more complex and useful)
