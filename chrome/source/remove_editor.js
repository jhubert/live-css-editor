(function () {
  var panel = document.getElementById('LiveCSSEditor-panel'),
    css = document.getElementById('LiveCSSEditor-PageCSS');

  css.parentElement.removeChild(css);
  panel.parentElement.removeChild(panel);
}());