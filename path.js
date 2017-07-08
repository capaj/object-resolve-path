// gutted from https://github.com/Polymer/observe-js/blob/master/src/observe.js
function noop () {}

function isIndex (s) {
  return +s === s >>> 0 && s !== ''
}

function isObject (obj) {
  return obj === Object(obj)
}

var createObject = '__proto__' in {}
  ? function (obj) {
    return obj
  }
  : function (obj) {
    var proto = obj.__proto__ // eslint-disable-line
    if (!proto) return obj
    var newObject = Object.create(proto)
    Object.getOwnPropertyNames(obj).forEach(function (name) {
      Object.defineProperty(
          newObject,
          name,
          Object.getOwnPropertyDescriptor(obj, name)
        )
    })
    return newObject
  }

function parsePath (path) {
  var keys = []
  var index = -1
  var c
  var newChar
  var key
  var type
  var transition
  var action
  var typeMap
  var mode = 'beforePath'

  var actions = {
    push: function () {
      if (key === undefined) return

      keys.push(key)
      key = undefined
    },

    append: function () {
      if (key === undefined) key = newChar
      else key += newChar
    }
  }

  function maybeUnescapeQuote () {
    if (index >= path.length) return

    var nextChar = path[index + 1]
    if (
      (mode === 'inSingleQuote' && nextChar === "'") ||
      (mode === 'inDoubleQuote' && nextChar === '"')
    ) {
      index++
      newChar = nextChar
      actions.append()
      return true
    }
  }

  while (mode) {
    index++
    c = path[index]

    if (c === '\\' && maybeUnescapeQuote(mode)) continue

    type = getPathCharType(c)
    typeMap = pathStateMachine[mode]
    transition = typeMap[type] || typeMap['else'] || 'error'

    if (transition === 'error') return // parse error

    mode = transition[0]
    action = actions[transition[1]] || noop
    newChar = transition[2] === undefined ? c : transition[2]
    action()

    if (mode === 'afterPath') {
      return keys
    }
  }

   // parse error
}

var identStart = '[$_a-zA-Z]'
var identPart = '[$_a-zA-Z0-9]'
var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$')

function isIdent (s) {
  return identRegExp.test(s)
}

var constructorIsPrivate = {}

function Path (parts, privateToken) {
  if (privateToken !== constructorIsPrivate) { throw Error('Use Path.get to retrieve path objects') }

  for (var i = 0; i < parts.length; i++) {
    this.push(String(parts[i]))
  }
}

var pathCache = {}

function getPath (pathString) {
  if (pathString instanceof Path) return pathString

  if (pathString == null || pathString.length === 0) pathString = ''

  if (typeof pathString !== 'string') {
    if (isIndex(pathString.length)) {
      // Constructed with array-like (pre-parsed) keys
      return new Path(pathString, constructorIsPrivate)
    }

    pathString = String(pathString)
  }

  var path = pathCache[pathString]
  if (path) return path

  var parts = parsePath(pathString)
  if (!parts) return invalidPath

  path = new Path(parts, constructorIsPrivate)
  pathCache[pathString] = path
  return path
}

Path.get = getPath

function formatAccessor (key) {
  if (isIndex(key)) {
    return '[' + key + ']'
  } else {
    return '["' + key.replace(/"/g, '\\"') + '"]'
  }
}

Path.prototype = createObject({
  __proto__: [],
  valid: true,

  toString: function () {
    var pathString = ''
    for (var i = 0; i < this.length; i++) {
      var key = this[i]
      if (isIdent(key)) {
        pathString += i ? '.' + key : key
      } else {
        pathString += formatAccessor(key)
      }
    }

    return pathString
  },

  getValueFrom: function (obj, directObserver) {
    for (var i = 0; i < this.length; i++) {
      if (obj == null) return
      obj = obj[this[i]]
    }
    return obj
  },

  iterateObjects: function (obj, observe) {
    for (var i = 0; i < this.length; i++) {
      if (i) obj = obj[this[i - 1]]
      if (!isObject(obj)) return
      observe(obj, this[i])
    }
  },

  setValueFrom: function (obj, value) {
    if (!this.length) return false

    for (var i = 0; i < this.length - 1; i++) {
      if (!isObject(obj)) return false
      obj = obj[this[i]]
    }

    if (!isObject(obj)) return false

    obj[this[i]] = value
    return true
  }
})

function getPathCharType (char) {
  if (char === undefined) return 'eof'

  var code = char.charCodeAt(0)

  switch (code) {
    case 0x5b: // [
    case 0x5d: // ]
    case 0x2e: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return char

    case 0x5f: // _
    case 0x24: // $
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0a: // Newline
    case 0x0d: // Return
    case 0xa0: // No-break space
    case 0xfeff: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029: // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if ((code >= 0x61 && code <= 0x7a) || (code >= 0x41 && code <= 0x5a)) { return 'ident' }

  // 1-9
  if (code >= 0x31 && code <= 0x39) return 'number'

  return 'else'
}

var pathStateMachine = {
  beforePath: {
    ws: ['beforePath'],
    ident: ['inIdent', 'append'],
    '[': ['beforeElement'],
    eof: ['afterPath']
  },

  inPath: {
    ws: ['inPath'],
    '.': ['beforeIdent'],
    '[': ['beforeElement'],
    eof: ['afterPath']
  },

  beforeIdent: {
    ws: ['beforeIdent'],
    ident: ['inIdent', 'append']
  },

  inIdent: {
    ident: ['inIdent', 'append'],
    '0': ['inIdent', 'append'],
    number: ['inIdent', 'append'],
    ws: ['inPath', 'push'],
    '.': ['beforeIdent', 'push'],
    '[': ['beforeElement', 'push'],
    eof: ['afterPath', 'push']
  },

  beforeElement: {
    ws: ['beforeElement'],
    '0': ['afterZero', 'append'],
    number: ['inIndex', 'append'],
    "'": ['inSingleQuote', 'append', ''],
    '"': ['inDoubleQuote', 'append', '']
  },

  afterZero: {
    ws: ['afterElement', 'push'],
    ']': ['inPath', 'push']
  },

  inIndex: {
    '0': ['inIndex', 'append'],
    number: ['inIndex', 'append'],
    ws: ['afterElement'],
    ']': ['inPath', 'push']
  },

  inSingleQuote: {
    "'": ['afterElement'],
    eof: ['error'],
    else: ['inSingleQuote', 'append']
  },

  inDoubleQuote: {
    '"': ['afterElement'],
    eof: ['error'],
    else: ['inDoubleQuote', 'append']
  },

  afterElement: {
    ws: ['afterElement'],
    ']': ['inPath', 'push']
  }
}

var invalidPath = new Path('', constructorIsPrivate)
invalidPath.valid = false
invalidPath.getValueFrom = invalidPath.setValueFrom = function () {}

module.exports = Path
