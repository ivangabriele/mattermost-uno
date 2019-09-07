chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  if (status !== "complete") return;

  const { url } = tab;
  if (url === undefined || !url.startsWith("https://mattermost.")) return;

  if (chrome.runtime.lastError) return;

  chrome.tabs.sendMessage(tabId, "areYouThere", async res => {
    if (res === undefined) {
      chrome.tabs.insertCSS({ file: "content.css" });
      chrome.tabs.executeScript({ file: "content.js" });
    }
  });
});
