/* Tell the extension to load the existing CSS if there is any */
(function () {
  var url = document.location,
    css = window.localStorage.getItem('livecsseditor-cache-' + url);

  if (css && css !== '') {
    chrome.extension.sendMessage({ modify : 'true' }, function (response) {});
  }
}());
