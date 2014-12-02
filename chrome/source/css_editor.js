/*jslint browser: true, maxerr: 50, indent: 2 */

var LiveCSSEditor = function (settings) {
  "use strict";

  settings = settings || { warn: true, save: true, modify: true, boxsize: null };

  var cssCache = '',
    keyupTimer = null,
    tab = '  ',
    urlKey = document.location,
    cssPrefix = 'LiveCSSEditor-';

  // Utility Functions
  function hasClass(el, name) {
    name = cssPrefix + name;
    return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
  }

  function addClass(el, name) {
    if (!hasClass(el, name)) {
      name = cssPrefix + name;
      el.className += (el.className ? ' ' : '') +name;
    }
  }

  function removeClass(el, name) {
    if (hasClass(el, name)) {
      name = cssPrefix + name;
      var newName = el.className;
      newName = newName.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ');
      newName = newName.replace(/^\s+|\s+$/g, '');
      el.className = newName;
    }
  }

  function handleTabInTextarea(evt) {
    var t = evt.target,
      ss = t.selectionStart,
      se = t.selectionEnd,
      pre,
      sel,
      post;

    if (evt.ctrlKey || evt.metaKey) {
      return;
    }

    // Tab key - insert tab expansion
    if (evt.keyCode === 9) {
      evt.preventDefault();

      // Special case of multi line selection
      if (ss !== se && t.value.slice(ss, se).indexOf("n") !== -1) {
        // In case selection was not of entire lines (e.g. selection begins in the middle of a line)
        // we ought to tab at the beginning as well as at the start of every following line.
        pre = t.value.slice(0, ss);
        sel = t.value.slice(ss, se).replace(/\n/g, "\n" + tab);
        post = t.value.slice(se, t.value.length);

        t.value = pre.concat(tab).concat(sel).concat(post);

        t.selectionStart = ss + tab.length;
        t.selectionEnd = se + tab.length;
      } else {
        // "Normal" case (no selection or selection on one line only)
        t.value = t.value.slice(0, ss).concat(tab).concat(t.value.slice(ss, t.value.length));
        if (ss === se) {
          t.selectionStart = t.selectionEnd = ss + tab.length;
        } else {
          t.selectionStart = ss + tab.length;
          t.selectionEnd = se + tab.length;
        }
      }
    } else if (evt.keyCode === 8 && t.value.slice(ss - tab.length, ss) === tab) {
      // Backspace key - delete preceding tab expansion, if exists
      evt.preventDefault();

      t.value = t.value.slice(0, ss - tab.length).concat(t.value.slice(ss, t.value.length));
      t.selectionStart = t.selectionEnd = ss - tab.length;
    } else if (evt.keyCode === 46 && t.value.slice(se, se + tab.length) === tab) {
      // Delete key - delete following tab expansion, if exists
      evt.preventDefault();

      t.value = t.value.slice(0, ss).concat(t.value.slice(ss + tab.length, t.value.length));
      t.selectionStart = t.selectionEnd = ss;
    } else if (evt.keyCode === 37 && t.value.slice(ss - tab.length, ss) === tab) {
      // Left/right arrow keys - move across the tab in one go
      evt.preventDefault();
      if (evt.shiftKey) {
        t.selectionStart = ss - tab.length;
      } else {
        t.selectionStart = t.selectionEnd = ss - tab.length;
      }
    } else if (evt.keyCode === 39 && t.value.slice(ss, ss + tab.length) === tab) {
      evt.preventDefault();
      if (evt.shiftKey) {
        t.selectionEnd = se + tab.length;
      } else {
        t.selectionStart = t.selectionEnd = se + tab.length;
      }
    }
  }

  function getEl(id) {
    return document.getElementById(cssPrefix + id);
  }

  function getStorage(key) {
    if (settings.save === true) {
      return window.localStorage.getItem('livecsseditor-' + key + '-' + urlKey);
    }
  }

  function setStorage(key, value) {
    if (settings.save === true) {
      window.localStorage.setItem('livecsseditor-' + key + '-' + urlKey, value);
      return true;
    }
  }

  function unsetStorage(key) {
    window.localStorage.removeItem('livecsseditor-' + key + '-' + urlKey);
    return true;
  }

  function toggleBottom() {
    var panel = getEl('panel'), position;

    if (panel.className.indexOf('bottom') === -1) {
      position = 'bottom';
      addClass(panel, 'bottom');
    } else {
      position = 'top';
      removeClass(panel, 'bottom');
    }

    setStorage('position', position);
  }

  function toggleLeftRight() {
    var panel = getEl('panel'), position;

    if (hasClass(panel, 'right')) {
      position = 'left';
      removeClass(panel, 'right');
      addClass(panel, 'left');
    } else {
      position = 'right';
      removeClass(panel, 'left');
      addClass(panel, 'right');
    }

    setStorage('positionLR', position);
  }

  function getBoxSize() {
    var values = ['', ''];

    if (getStorage('boxsize') && getStorage('boxsize') !== ',') {
      values = getStorage('boxsize').replace(/px/g, '').split(',');
    } else if (settings.boxsize) {
      values = settings.boxsize.split(',');
    }

    return values;
  }

  function currentBoxSize() {
    var style = getEl('code').style,
      width = parseInt(style.width, 10) || '',
      height = parseInt(style.height, 10) || '';

    return [width, height].join(',');
  }

  function setBoxSize(boxsize) {
    var code = getEl('code');

    code.style.width = (boxsize[0] && boxsize[0] + 'px') || '';
    code.style.height = (boxsize[1] && boxsize[1] + 'px') || '';

    return true;
  }

  function resetBoxSize() {
    var boxsize,
      code = getEl('code'),
      defaultBoxSize = settings && settings.boxsize;

    // If the user hits resize when it's already at the default box size
    // remove the sizing entirely to allow them to resize with the handler
    if (!getStorage('boxsize') && currentBoxSize() === defaultBoxSize) {
      code.style.width = '';
      code.style.height = '';
      return true;
    }

    unsetStorage('boxsize');

    boxsize = getBoxSize();

    setBoxSize(boxsize);

    return true;
  }

  function resetCSSTag() {
    var css = getEl('PageCSS');

    if (!settings.modify) {
      css.parentElement.removeChild(css);
    }
  }

  function removeEditor() {
    var panel = getEl('panel'), code = getEl('code'), boxSize = currentBoxSize();

    if (settings.save !== true && settings.warn === true && code.value !== '') {
      if (!confirm(chrome.i18n.getMessage("warningOnClose"))) {
        return;
      }
    }

    if (boxSize === ',') {
      unsetStorage('boxsize');
    } else {
      setStorage('boxsize', currentBoxSize());
    }

    resetCSSTag();
    panel.parentElement.removeChild(panel);
  }

  function activateButtons() {
    var bottomButton = getEl('bot'),
      closeButton = getEl('close'),
      codeArea = getEl('code'),
      resetButton = getEl('reset'),
      leftRightButton = getEl('leftright');

    bottomButton.onclick = toggleBottom;
    closeButton.onclick = removeEditor;
    codeArea.onkeydown = handleTabInTextarea;
    codeArea.onkeyup = function () {
      keyupTimer && clearTimeout(keyupTimer);
      keyupTimer = setTimeout(updateCSSTag, 100);
    };
    leftRightButton.onclick = toggleLeftRight;
    resetButton.onclick = resetBoxSize;
  }

  function editorHtmlContent() {
    return '\
    <div id="LiveCSSEditor-actions">\
      <div id="LiveCSSEditor-close">Close</div> \
      <div id="LiveCSSEditor-bot">Bottom</div> \
      <div id="LiveCSSEditor-leftright">Left / Right</div> \
      <div id="LiveCSSEditor-reset">Reset</div> \
    </div> \
    <div id="LiveCSSEditor-pad"> \
      <div id="LiveCSSEditor-label">' + chrome.i18n.getMessage("editorTitle") + '</div> \
      <textarea id="LiveCSSEditor-code"></textarea> \
    </div>\
    ';
  }

  function addEditorPane() {
    var objPanel = document.createElement('div'),
      code;

    objPanel.setAttribute('id', 'LiveCSSEditor-panel');
    objPanel.innerHTML = editorHtmlContent();

    document.body.appendChild(objPanel);

    code = getEl('code');

    setBoxSize(getBoxSize());

    if (getStorage('position') === 'bottom') {
      toggleBottom();
    }

    // Default to right side
    addClass(objPanel, 'right');
    if (getStorage('positionLR') === 'left') {
      toggleLeftRight();
    }

    activateButtons();

    code.focus();
  }

  function addStyleTag() {

    if (document.getElementById('LiveCSSEditor-PageCSS')) {
      return;
    }

    var head = document.getElementsByTagName('head')[0], obj = document.createElement('style');

    obj.id = 'LiveCSSEditor-PageCSS';
    obj.setAttribute("type", "text/css");
    head.appendChild(obj);
  }

  function fillStyleTag(css) {
    var obj = getEl('PageCSS');

    css = css || '';

    obj.innerHTML = css;
    cssCache = css;

    setStorage('cache', css);
  }

  function updateCSSTag() {
    var source = getEl('code');
    /* Don't bother replacing the CSS if it hasn't changed */
    if (source) {
      if (cssCache === source.value) {
        return false;
      }
      fillStyleTag(source.value);
    }
  }

  function init() {
    var source, css;

    addStyleTag();
    addEditorPane();

    css = getStorage('cache');
    source = getEl('code');
    if (css && source) {
      source.value = css;
    }
    fillStyleTag(css);

    updateCSSTag();
  }

  if (!getEl('panel')) {
    init();
  } else {
    removeEditor();
  }
};
