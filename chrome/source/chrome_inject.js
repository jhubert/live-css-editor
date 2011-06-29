chrome.extension.sendRequest({ settings : 'keycode' }, function(response) {
  var keyCommand = response && parseInt(response.value, 0);

  window.addEventListener("keydown", function(event) {
    // Bind to both command (for Mac) and control (for Win/Linux)
    var modifier = event.ctrlKey || event.metaKey;

    if (modifier && event.shiftKey && event.keyCode == keyCommand) {
      if (document.getElementById('LiveCSSEditor-panel')) {
        chrome.extension.sendRequest({ stop : true }, function(response) {});
      } else {
        chrome.extension.sendRequest({ start : true }, function(response) {});
      }
    }
  }, false);
});