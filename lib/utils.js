
/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

var keys = Object.keys || function keys (obj) {
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

// from https://gist.github.com/mathiasbynens/bbe7f870208abcfec860
var loneSurrogatesRegex = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g;

/**
 * Sanitize a WTF-8 string, replacing lone surrogates with
 * U+FFFD 'REPLACEMENT CHARACTER'
 *
 * @return {String} str
 * @api private
 */
var sanitizeString = function (str) {
  return str.replace(loneSurrogatesRegex, '\uFFFD');
};

module.exports = {
  keys: keys,
  sanitizeString: sanitizeString
};
