/*jslint browser: true, maxerr: 50, indent: 2 */

var LiveCSSEditor = function (settings) {
  "use strict";

  settings = settings || { warn: true, save: true, modify: true };

  var cssCache = '',
    timer = null,
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
    } else {
      return false;
    }
  }

  function setStorage(key, value) {
    if (settings.save === true) {
      window.localStorage.setItem('livecsseditor-' + key + '-' + urlKey, value);
      return true;
    } else {
      return false;
    }
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

  function resetBoxSize() {
    var code = getEl('code');

    code.style.width = '';
    code.style.height = '';
    setStorage('boxsize', null);

    return true;
  }

  function resetCSSTag() {
    var css = getEl('PageCSS');

    if (!settings.modify) {
      css.parentElement.removeChild(css);
    }
  }

  function removeEditor() {
    var panel = getEl('panel'), code = getEl('code');

    if (settings.save !== true && settings.warn === true && code.value !== '') {
      if (!confirm(chrome.i18n.getMessage("warningOnClose"))) {
        return;
      }
    }

    setStorage('boxsize', code.style.width + ',' + code.style.height);

    clearInterval(timer);
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
      boxsize = getStorage('boxsize') && getStorage('boxsize').split(','),
      code;

    objPanel.setAttribute('id', 'LiveCSSEditor-panel');
    objPanel.innerHTML = editorHtmlContent();

    document.body.appendChild(objPanel);

    code = getEl('code');

    if (getStorage('position') === 'bottom') {
      toggleBottom();
    }

    // Default to right side
    addClass(objPanel, 'right');
    if (getStorage('positionLR') === 'left') {
      toggleLeftRight();
    }

    if (boxsize) {
      code.style.width = boxsize[0];
      code.style.height = boxsize[1];
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

  function autoUpdate() {
    var source = getEl('code');
    /* Don't bother replacing the CSS if it hasn't changed */
    if (source) {
      if (cssCache === source.value) {
        return false;
      }
      fillStyleTag(source.value);
    } else {
      clearInterval(timer);
    }
  }

  function startAutoUpdate() {
    timer = setInterval(autoUpdate, 1000);
  }

  function init() {
    var source, css;

    addStyleTag();
    addEditorPane();

    css = getStorage('cache');
    if (css) {
      source = getEl('code');
      source.value = css;
    }
    fillStyleTag(css);

    startAutoUpdate();
  }

  if (!getEl('panel')) {
    init();
  } else {
    removeEditor();
  }
};
