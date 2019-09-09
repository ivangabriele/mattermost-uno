(function () {
  'use strict';

  /* eslint-disable import/prefer-default-export */
  const CHANNEL_MESSAGE = {
    CONTENT_IS_MATTERMOST: "TAB_IS_MATTERMOST"
  };

  const ports = [];
  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== "mattermost-uno") return;
    ports[port.sender.tab.id] = port; // eslint-disable-next-line no-shadow

    port.onDisconnect.addListener(port => {
      const tabId = port.sender.tab.id;
      delete ports[tabId];
      chrome.browserAction.setTitle({
        tabId,
        title: "Enable Mattermost Uno"
      });
      chrome.browserAction.setIcon({
        tabId,
        path: "icons/icon-32x32-bw.png"
      });
    }); // eslint-disable-next-line no-shadow

    port.onMessage.addListener((message, port) => {
      const tabId = port.sender.tab.id;

      switch (message.value) {
        case CHANNEL_MESSAGE.CONTENT_IS_MATTERMOST:
          chrome.browserAction.setTitle({
            tabId,
            title: "Disable Mattermost Uno"
          });
          chrome.browserAction.setIcon({
            tabId,
            path: "icons/icon-32x32.png"
          });
          break;

        default:
          console.error("Something went wrong.");
      }
    });
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const {
      status
    } = changeInfo;
    if (status !== "complete") return;
    const {
      url
    } = tab;
    if (url === undefined || !url.includes("mattermost")) return;

    if (ports[tabId] === undefined) {
      chrome.tabs.insertCSS(tabId, {
        file: "content.css"
      });
      chrome.tabs.executeScript(tabId, {
        file: "content.js"
      });
    }
  });

}());
