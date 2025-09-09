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
