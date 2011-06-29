var keyCommand, warn, save, keyString, keyValue, warnYes, warnNo, saveYes, saveNo, charMap = {
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

  if (typeof keyCommand === "undefined") {
    keyCommand = 69;
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
}

function init() {
  keyCommand = localStorage["keycode"];
  warn = localStorage["warn"];
  save = localStorage["save"];
  keyString = document.getElementById('keycode-string');
  keyValue = document.getElementById('keycode-value');
  warnYes = document.getElementById('warn-yes');
  warnNo = document.getElementById('warn-no');
  saveYes = document.getElementById('save-yes');
  saveNo = document.getElementById('save-no');

  restore_options();
}

function getKeyCode(e) {
  keyString.value = stringFromCharCode(e.keyCode);
  keyValue.value = e.keyCode;
  return false;
}