(function() {
  if (typeof Tilde === 'undefined') {
    Tilde = {};
  }

  //http://stackoverflow.com/questions/1442542/how-can-i-get-default-font-size-in-pixels-by-using-javascript-or-jquery
  window.Tilde.getDefaultFontSize = function getDefaultFontSize(pa) {
    try {
      if (
        top != window &&
        typeof top.$ !== 'undefined' &&
        typeof top.$.fn !== 'undefined' &&
        typeof top.$.fn.defaultFontSize !== 'undefined'
      ) {
        return top.$.fn.defaultFontSize;
      }
    } catch (error) {
      console.log(error);
    }

    if (window.Tilde.defaultFontSize) {
      return window.Tilde.defaultFontSize;
    }

    pa = pa || document.body;
    if (!pa) {
      return null;
    }

    var who = document.createElement('span');

    who.style.cssText = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';

    who.appendChild(document.createTextNode('M'));
    pa.appendChild(who);
    window.Tilde.defaultFontSize = [who.offsetWidth, who.offsetHeight];
    pa.removeChild(who);
    return window.Tilde.defaultFontSize;
  };
})();
