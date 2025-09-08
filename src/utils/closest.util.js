/*
 * Polyfill für Element.matches (IE11 und ältere Browser)
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
