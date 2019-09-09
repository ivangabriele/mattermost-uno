let isEnabled = false;

let tabs = [];

function enable(tabId) {
  if (!tabs.includes(tabId)) tabs.push(tabId);

  chrome.tabs.insertCSS(tabId, { file: "content.css" });
  chrome.tabs.executeScript(tabId, { file: "content.js" });

  chrome.browserAction.setTitle({ tabId, title: "Disable Mattermost Uno" });
  chrome.browserAction.setIcon({ tabId, path: "icons/icon-32x32.png" });

  isEnabled = true;
}

function disable(tabId) {
  if (!tabs.includes(tabId)) tabs = tabs.filter(id => id !== tabId);

  chrome.tabs.executeScript(tabId, { code: `location.reload();` });

  chrome.browserAction.setTitle({ tabId, title: "Enable Mattermost Uno" });
  chrome.browserAction.setIcon({ tabId, path: "icons/icon-32x32-bw.png" });

  isEnabled = false;
}

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, "areYouThere", async res => {
    if (res === undefined) enable(tab.id);
    else disable(tab.id);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  const { status } = changeInfo;
  if (status !== "complete") return;

  chrome.tabs.sendMessage(tabId, "areYouThere", async res => {
    if (isEnabled && res === undefined) enable(tabId);
  });
});
