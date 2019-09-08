// eslint-disable-next-line func-names
window.browser = (function() {
  return window.browser || window.chrome;
})();

let isEnabled = false;

function enable(tabId) {
  window.browser.tabs.insertCSS(tabId, { file: "content.css" });
  window.browser.tabs.executeScript(tabId, { file: "content.js" });

  window.browser.browserAction.setTitle({ tabId, title: "Disable Mattermost Uno" });
  window.browser.browserAction.setIcon({ tabId, path: "icons/icon-32x32.png" });

  isEnabled = true;
}

function disable(tabId) {
  window.browser.tabs.executeScript(tabId, { code: `location.reload();` });

  window.browser.browserAction.setTitle({ tabId, title: "Enable Mattermost Uno" });
  window.browser.browserAction.setIcon({ tabId, path: "icons/icon-32x32-bw.png" });

  isEnabled = false;
}

window.browser.browserAction.onClicked.addListener(tab => {
  window.browser.tabs.sendMessage(tab.id, "areYouThere", async res => {
    if (res === undefined) enable(tab.id);
    else disable(tab.id);
  });
});

window.browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  const { status } = changeInfo;
  if (status !== "complete") return;

  window.browser.tabs.sendMessage(tabId, "areYouThere", async res => {
    if (isEnabled && res === undefined) enable(tabId);
  });
});
