/**
 * Polyfill for [].find (Finds an element in an array)
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    var list = Object(this);
    var length = list.length >>> 0;

    for (var i = 0; i < length; i++) {
      var value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

/**
 * Polyfill for [].includes
 */
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);
    var len = o.length >>> 0;

    if (len === 0) {
      return false;
    }

    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len + n, 0);

    while (k < len) {
      // SameValueZero comparison
      if (o[k] === searchElement || (typeof o[k] === 'number' && typeof searchElement === 'number' && isNaN(o[k]) && isNaN(searchElement))) {
        return true;
      }
      k++;
    }

    return false;
  };
}

/**
 * Polyfills the method includes for strings in browsers
 * that dont support the method
 */
if (!String.prototype.includes) {
  String.prototype.includes = function(searchString) {
    return this.indexOf(searchString) >= 0;
  }
}

/**
 * Polyfills the method startsWith for Strings in browsers
 * that dont support the method
 */
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    var pos = position || 0;
    return this.substr(pos, searchString.length) === searchString;
  };
}

/*
 * Polyfill for Element.matches (IE11 and older browsers)
 */ 
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    function(selector) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
      for (var i = 0; i < matches.length; i++) {
        if (matches[i] === this) return true;
      }
      return false;
    };
}

/**
 * Polyfill für Element.closest (IE11 und ältere Browser)
 */
if (!Element.prototype.closest) {
  Element.prototype.closest = function(selector) {
    var el = this;
    do {
      if (el.matches(selector)) return el;
      el = el.parentElement || el.parentNode;
    } while (el && el.nodeType === 1);
    return null;
  };
}

/**
 * Polyfill to generate a UUID for older Browsers like Internet Explorer 11
 */
(function () {
  if (typeof window.crypto === 'undefined') {
    window.crypto = {};
  }

  if (typeof window.crypto.randomUUID !== 'function') {
    window.crypto.randomUUID = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
})();
