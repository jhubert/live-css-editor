(function () {
  var d = document,
    head = d.getElementsByTagName('head')[0],
    obj = d.createElement('style'),
    url = d.location;

  obj.id = 'LiveCSSEditor-PageCSS';
  obj.setAttribute("type", "text/css");
  obj.innerHTML = window.localStorage.getItem('livecsseditor-cache-' + url);
  head.appendChild(obj);
}());