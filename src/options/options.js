function saveOptions(e) {
  e.preventDefault();
  chrome.storage.sync.set({
    mattermost_url: document.querySelector("#mattermost_url").value,
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#mattermost_url").value = result.mattermost_url || "";
  }

  chrome.storage.sync.get(["mattermost_url"], res => setCurrentChoice(res));
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
