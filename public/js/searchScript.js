
console.log('loading searchScript.js');

(function (window, document) {

  var input, clearBtn;
  try {
    input = document.getElementsByClassName('filter-input')[0];
    clearBtn = document.getElementsByClassName('filter-clear')[0];
  } catch (e) {
    return;
  }

  var map = {};

  var subset = {};

  function clearBlock() {
    links.forEach(function (link) { link.el.style.display = ''; });
  }
  function hideEl(link, hide) {
    link.el.style.display = hide ? 'none' : '';
  }

  console.log('in closure');

  /**
   * All the compound objects of the DOM.
   * @type {Array<{trunc: string, el: HTMLElement, text: string}>}
   */
  var links = Array.prototype.slice.apply(
    document.getElementsByTagName('p'))
    .filter(function (el) {
      return el.hasAttribute('data-indexable');
    })
    .map(function (el) {
      return { text: el.innerText.toLowerCase(), el: el, trunc: el.innerText.replace(/[^\w]+/igm, '').toLowerCase() };
    });

  var trunc, len, i, lc, c, me;
  links.forEach(function (link) {
    trunc = link.trunc;
    lc = trunc.charAt(0);
    len = trunc.length;
    for (i = 1; i < len; ++i) {
      c = trunc.charAt(i);
      me = map[lc + c] || [];

      if (me.indexOf(link) === -1) me.push(link);

      map[lc + c] = me;
      lc = c;
    }
  });

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    var recent = false;
    return function() {
      recent = true;
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (recent) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
        recent = false;
      }
    };
  }

  var searchStr, lastSearchStr = '';

  /**
   *
   * @param {InputEvent} e
   */
  function updateSearch(e) {
    searchStr = e.target.value.replace(/[^\w ]/igm, ' ').trim();
    if (searchStr === lastSearchStr) return;

    if (e.target.value) {
      clearBtn.style.display = 'inline-block';
    } else {
      clearBtn.style.display = '';
    }

    subset = null;

    var tokens = searchStr.split(/[ ]+/ig);

    lastSearchStr = searchStr;

    var lastSet = null;
    var countMatches = 0;
    tokens.forEach(function (token) {
      if (token.length < 2) {
        return;
      }

      countMatches++;
      var newSet = {};
      subset = {};

      var sub = token.substr(0, 2);
      var mr = map[sub];
      if (mr) {
        var link;
        var i;
        for (i = 0; i < mr.length; ++i) {
          link = mr[i];
          if (link.text.indexOf(token) > -1) {
            newSet[link.trunc] = link.el;
          }
        }
      }

      if (lastSet) {
        // intersect them
        var lastKeys = Object.keys(lastSet);
        lastKeys.forEach(function (k) { if (newSet[k]) subset[k] = newSet[k]; })
      } else {
        subset = newSet;
      }

      lastSet = subset;
    });

    if (!countMatches) {
      clearBlock();
    } else {
      subset = lastSet;
      links.forEach(function (link) {
        hideEl(link, !subset[link.trunc]);
      });
    }

    //console.log(tokens);
  }

  input.addEventListener('input', debounce(updateSearch, 500, true));
  clearBtn.addEventListener('click', function () {
    input.value = '';
    updateSearch({target: {value: ''}});
  });

  console.log('loaded: links ' + links.length);
})(window, document);
