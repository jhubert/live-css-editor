/*jslint browser: true, devel: true, plusplus: true, regexp: true, maxerr: 50, indent: 2 */
/*globals chrome */

(function () {
  "use strict";

  var warn = true, save = true, modify = true, warnYes, warnNo, saveYes, saveNo, modifyYes, modifyNo, boxSize, boxSizeH, boxSizeW;

  function byId(id) {
    return document.getElementById(id);
  }

  // Saves options to localStorage.
  function save_options() {
    localStorage.warn = !!warnYes.checked;
    localStorage.save = !!saveYes.checked;
    localStorage.modify = !!modifyYes.checked;
    localStorage.boxsize = boxSizeW.value.replace(/[^\d]/g, '') + ',' + boxSizeH.value.replace(/[^\d]/g, '');

    alert('Changes Saved');
    window.close();
  }

  // Restores select box state to saved value from localStorage.
  function restore_options() {
    if (boxSize !== undefined) {
      var boxSizes = boxSize.split(',');
      boxSizeW.value = boxSizes[0];
      boxSizeH.value = boxSizes[1];
    }

    if (warn) {
      warnYes.checked = true;
    } else {
      warnNo.checked = true;
    }

    if (save) {
      saveYes.checked = true;
    } else {
      saveNo.checked = true;
    }

    if (modify) {
      modifyYes.checked = true;
    } else {
      modifyNo.checked = true;
    }
  }

  function applyTranslations() {
    var objects = document.getElementsByTagName('*'), i;

    for (i = 0; i < objects.length; i++) {
      if (objects[i].dataset && objects[i].dataset.message) {
        objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
      }
    }
  }

  function init() {
    var button = byId('save-button');

    button.onclick = function () { save_options(); };

    console.log('hello');
    if (localStorage.hasOwnProperty('warn')) {
      console.log('hi');
      warn = localStorage.warn === "true";
    }

    if (localStorage.hasOwnProperty('save')) {
      save = localStorage.save === "true";
    }

    if (localStorage.hasOwnProperty('modify')) {
      modify = localStorage.modify === "true";
    }

    if (localStorage.hasOwnProperty('boxsize')) {
      boxSize = localStorage.boxsize;
    }

    warnYes = byId('warn-yes');
    warnNo = byId('warn-no');
    saveYes = byId('save-yes');
    saveNo = byId('save-no');
    modifyYes = byId('modify-yes');
    modifyNo = byId('modify-no');
    boxSizeH = byId('box-size-h');
    boxSizeW = byId('box-size-w');

    applyTranslations();
    restore_options();
  }

  window.onload = function () {
    init();
  };
}());
