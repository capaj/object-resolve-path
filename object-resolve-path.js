//heavily inspired by http://stackoverflow.com/a/6491621/671457
/**
 *
 * @param {Object} o
 * @param {String} path
 * @returns {*}
 */
module.exports = function(o, path) {
  if (typeof path !== 'string') {
    throw new TypeError('path must be a string');
  }
  if (path.length === 0) {
    return o;
  }
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, '');           // strip a leading dot
  var a = path.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};