/* Set up the key commands based on the keycode setting */
chrome.extension.sendMessage({ settings : 'keycode' }, function (response) {
  var keyCommand = response && parseInt(response.value, 0);

  window.addEventListener("keydown", function(event) {
    // Bind to both command (for Mac) and control (for Win/Linux)
    var modifier = event.ctrlKey || event.metaKey;

    if (modifier && event.shiftKey && event.keyCode == keyCommand) {
      if (document.getElementById('LiveCSSEditor-panel')) {
        chrome.extension.sendMessage({ stop : true }, function(response) {});
      } else {
        chrome.extension.sendMessage({ start : true }, function(response) {});
      }
    }
  }, false);
});

/* Tell the extension to load the existing CSS if there is any */
(function () {
  var url = document.location,
    css = window.localStorage.getItem('livecsseditor-cache-' + url);

  if (css && css !== '') {
    chrome.extension.sendMessage({ modify : 'true' }, function (response) {});
  }
}());