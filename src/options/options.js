function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    mattermost_url: document.querySelector("#mattermost_url").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#mattermost_url").value = result.mattermost_url || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("mattermost_url");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
