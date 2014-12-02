/*jslint browser: true, devel: true, maxerr: 50, indent: 2 */
/*global chrome */

(function () {
  "use strict";

  function setItem(key, value) {
    try {
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    } catch (ignore) {}
  }

  function getItem(key) {
    var value;
    try {
      value = window.localStorage.getItem(key);
    } catch (ignore) {}
    return value;
  }

  function setupDefaults() {
    if (!localStorage.hasOwnProperty('warn')) {
      setItem('warn', 'true');
    }

    if (!localStorage.hasOwnProperty('save')) {
      setItem('save', 'true');
    }
  }

  function injectEditor() {
    setupDefaults();

    chrome.tabs.insertCSS(null, {file: "css_editor.css"});

    var options = {
      warn: getItem('warn') === "true",
      save: getItem('save') === "true",
      modify: getItem('modify') === "true",
      boxsize: getItem('boxsize') || ''
    },
    code = 'LiveCSSEditor(' + JSON.stringify(options) + ');';

    chrome.tabs.executeScript(null, {file: "css_editor.js"}, function () {
      chrome.tabs.executeScript(null, {code: code});
    });
  }

  function loadExistingStyle(tabId) {
    if (getItem('modify') === 'true') {
      chrome.browserAction.setBadgeText({ text: "*", tabId: tabId });
      chrome.tabs.executeScript(null, {file: "existing_styles.js"});
    }
  }

  function handleFileSchemeAccess(isAllowedAccess) {
    if (isAllowedAccess) {
      injectEditor();
    } else {
      if (confirm(chrome.i18n.getMessage('errorFileURL'))) {
        chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
      }
    }
  }

  chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.modify) {
        loadExistingStyle(sender.tab.id);
      }
      sendResponse({});
    }
  );

  // Called when the user clicks on the browser action.
  chrome.browserAction.onClicked.addListener(function (tab) {
    var url = tab.url;

    if (url.indexOf('chrome') === 0) {
      alert(chrome.i18n.getMessage('errorChromeURL'));
      return;
    }

    if (url.indexOf('file:///') === 0) {
      chrome.extension.isAllowedFileSchemeAccess(handleFileSchemeAccess);
    } else {
      injectEditor();
    }
  });

}());
