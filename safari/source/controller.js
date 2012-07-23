(function () {
  var translations = {
    "extName": { "message": "Live CSS Editor", "description": "The name of this extension." },
    "extDescription": { "message": "Live Write CSS onto any page", "description": "The description of this extension." },
    "extBrowserActionName": { "message": "Enable the editor", "description": "The text shown to the user when they hover over the browser action button." },
    "editorTitle": { "message": "Live CSS Editor", "description": "The text shown on the actual editor." },
    "warningOnClose": { "message": "Are you sure you want to do this? All of your changes will be lost.", "description": "The warning that is shown to the user if they close the editor with content in it." },
    "buttonLabelClose": { "message": "Close Editor", "description": "The hover text for the close button" },
    "buttonLabelBottom": { "message": "Toggle top / bottom position", "description": "The hover text for the top/bottom position button" },
    "buttonLabelLeftRight": { "message": "Toggle left / right position", "description": "The hover text for the left/right position button" },
    "buttonLabelReset": { "message": "Reset the box size", "description": "The hover text for the reset box size button" }
  }

  window.chrome = {
    i18n: {
      getMessage: function (key) {
        return translations[key] && translations[key].message;
      }
    }
  }

  function loadExistingStyles() {
    var d = document,
      head = d.getElementsByTagName('head')[0],
      obj = d.createElement('style'),
      url = d.location;

    obj.id = 'LiveCSSEditor-PageCSS';
    obj.setAttribute("type", "text/css");
    obj.innerHTML = window.localStorage.getItem('livecsseditor-cache-' + url);
    head.appendChild(obj);
  }

  function handleMessage(event){

    var data = event.message;

    if (data.command === 'toggle') {
      LiveCSSEditor(data);
    } else if (data.command === 'loadExistingStyles') {
      loadExistingStyles();
    }
  }

  // Ignore all commands if it's not the top document
  if (top.location == document.location) {
    safari.self.addEventListener("message", handleMessage, false);

    /* Set up the key commands based on the keycode setting. Not handling in
          Safari because of the way that settings are managed.
    safari.self.tab.dispatchMessage("settings", { settings : 'keycode' });
    */

    /* Check if the existing styles should be loaded */
    safari.self.tab.dispatchMessage("modify", {});
  }
})();