var keyCommand, warn, save, modify, keyString, keyValue, warnYes, warnNo, saveYes, saveNo, modifyYes, modifyNo, boxSize, boxSizeH, boxSizeW, charMap = {
  8 : "backspace",
  9 : "tab",
  13 : "enter",
  16 : "shift",
  17 : "ctrl",
  18 : "alt",
  19 : "pause/break",
  20 : "caps lock",
  27 : "escape",
  33 : "page up",
  34 : "page down",
  35 : "end",
  36 : "home",
  37 : "left arrow",
  38 : "up arrow",
  39 : "right arrow",
  40 : "down arrow",
  45 : "insert",
  46 : "delete",
  91 : "left window",
  92 : "right window",
  93 : "select key",
  96 : "numpad 0",
  97 : "numpad 1",
  98 : "numpad 2",
  99 : "numpad 3",
  100 : "numpad 4",
  101 : "numpad 5",
  102 : "numpad 6",
  103 : "numpad 7",
  104 : "numpad 8",
  105 : "numpad 9",
  106 : "multiply",
  107 : "add",
  109 : "subtract",
  110 : "decimal point",
  111 : "divide",
  112 : "F1",
  113 : "F2",
  114 : "F3",
  115 : "F4",
  116 : "F5",
  117 : "F6",
  118 : "F7",
  119 : "F8",
  120 : "F9",
  121 : "F10",
  122 : "F11",
  123 : "F12",
  144 : "num lock",
  145 : "scroll lock",
  186 : ";",
  187 : "=",
  188 : ",",
  189 : "-",
  190 : ".",
  191 : "/",
  192 : "`",
  219 : "[",
  220 : "\\",
  221 : "]",
  222 : "'"
};

function stringFromCharCode(code) {
  return charMap[code] || String.fromCharCode(code);
}

// Saves options to localStorage.
function save_options() {
  localStorage["keycode"] = keyValue.value;
  localStorage["boxsize"] = boxSizeW.value.replace(/[^\d]/g, '') + ',' + boxSizeH.value.replace(/[^\d]/g, '');

  if (warnYes.checked) {
    localStorage["warn"] = true;
  } else {
    localStorage["warn"] = false;
  }

  if (saveYes.checked) {
    localStorage["save"] = true;
  } else {
    localStorage["save"] = false;
  }

  if (modifyYes.checked) {
    localStorage["modify"] = true;
  } else {
    localStorage["modify"] = false;
  }

  alert('Changes Saved');
  window.close();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  if (typeof save === "undefined") {
    save = true;
  }

  if (typeof warn === "undefined") {
    warn = true;
  }

  if (typeof modify === "undefined") {
    modify = true;
  }

  if (typeof keyCommand === "undefined") {
    keyCommand = 69;
  }

  if (typeof boxSize !== "undefined") {
    var boxSizes = boxSize.split(',');
    boxSizeW.value = boxSizes[0];
    boxSizeH.value = boxSizes[1];
  }

  keyString.value = stringFromCharCode(keyCommand);
  keyValue.value = keyCommand;

  if (warn === "true") {
    warnYes.checked = true;
  } else {
    warnNo.checked = true;
  }

  if (save === "true") {
    saveYes.checked = true;
  } else {
    saveNo.checked = true;
  }

  if (modify === "true") {
    modifyYes.checked = true;
  } else {
    modifyNo.checked = true;
  }
}

function init() {
  keyCommand = localStorage["keycode"];
  warn = localStorage["warn"];
  save = localStorage["save"];
  modify = localStorage["modify"];
  boxSize = localStorage["boxsize"];

  keyString = document.getElementById('keycode-string');
  keyValue = document.getElementById('keycode-value');
  warnYes = document.getElementById('warn-yes');
  warnNo = document.getElementById('warn-no');
  saveYes = document.getElementById('save-yes');
  saveNo = document.getElementById('save-no');
  modifyYes = document.getElementById('modify-yes');
  modifyNo = document.getElementById('modify-no');
  boxSizeH = document.getElementById('box-size-h');
  boxSizeW = document.getElementById('box-size-w');

  var objects = document.getElementsByTagName('*'), i;
  for(i = 0; i < objects.length; i++) {
    if (objects[i].dataset && objects[i].dataset.message) {
      objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
    }
  }

  var button = document.getElementById('save-button');
  button.onclick = function () { save_options(); };

  restore_options();
}

function getKeyCode(e) {
  keyString.value = stringFromCharCode(e.keyCode);
  keyValue.value = e.keyCode;
  return false;
}

window.onload = function () {
  init();
}
