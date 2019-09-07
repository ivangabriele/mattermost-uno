import moment from "moment";

import e from "../helpers/e";
import removeNodeChildren from "../helpers/removeNodeChildren";

export default function updateCounters(rootPostsWithReplies) {
  rootPostsWithReplies.forEach(({ $button, $node, authors, count, updatedAt }) => {
    const $rootPostContent = $node.querySelector(".post__body");
    if ($rootPostContent === null) {
      e("Root Posts Updating", "I can't find the root post content node.");

      return;
    }

    // If the counter is already injected, we just need to update its values:
    if ($node.querySelector(".MattermostUno-counter") !== null) {
      const $counterAuthors = $node.querySelector(".MattermostUno-counterAuthors");
      if ($counterAuthors === null) {
        e("Root Posts Updating", "I can't find the existing counter authors node.");

        return;
      }

      const $counterLink = $node.querySelector(".MattermostUno-counterLink");
      if ($counterLink === null) {
        e("Root Posts Updating", "I can't find the existing counter link node.");

        return;
      }

      const $counterDescriptionOff = $node.querySelector(".MattermostUno-counterDescriptionOff");
      if ($counterDescriptionOff === null) {
        e("Root Posts Updating", "I can't find the existing counter off-description node.");

        return;
      }

      removeNodeChildren($counterAuthors);
      authors.forEach(uri => {
        const $authorImage = document.createElement("img");
        $authorImage.src = uri;
        $counterAuthors.appendChild($authorImage);
      });

      removeNodeChildren($counterLink);
      const counterLinkText = `${count} repl${count > 1 ? "ies" : "y"}`;
      const $counterLinkText = document.createTextNode(counterLinkText);
      $counterLink.appendChild($counterLinkText);

      removeNodeChildren($counterDescriptionOff);
      const counterDescriptionOffText = `Last reply ${moment(updatedAt).fromNow()}`;
      const $counterDescriptionOffText = document.createTextNode(counterDescriptionOffText);
      $counterDescriptionOff.appendChild($counterDescriptionOffText);

      return;
    }

    const $counter = document.createElement("div");
    $counter.classList.add("MattermostUno-counter");
    $counter.addEventListener("click", () => $button.click());

    const $counterAuthors = document.createElement("div");
    $counterAuthors.classList.add("MattermostUno-counterAuthors");
    authors.forEach(uri => {
      const $authorImage = document.createElement("img");
      $authorImage.src = uri;
      $counterAuthors.appendChild($authorImage);
    });
    $counter.appendChild($counterAuthors);

    const $counterLink = document.createElement("a");
    $counterLink.classList.add("MattermostUno-counterLink");
    const counterLinkText = `${count} repl${count > 1 ? "ies" : "y"}`;
    const $counterLinkText = document.createTextNode(counterLinkText);
    $counterLink.appendChild($counterLinkText);
    $counter.appendChild($counterLink);

    const $counterDescription = document.createElement("div");
    $counterDescription.classList.add("MattermostUno-counterDescription");
    const $counterDescriptionOff = document.createElement("span");
    $counterDescriptionOff.classList.add("MattermostUno-counterDescriptionOff");
    const counterDescriptionOffText = `Last reply ${moment(updatedAt).fromNow()}`;
    const $counterDescriptionOffText = document.createTextNode(counterDescriptionOffText);
    $counterDescriptionOff.appendChild($counterDescriptionOffText);
    $counterDescription.appendChild($counterDescriptionOff);
    const $counterDescriptionOn = document.createElement("span");
    $counterDescriptionOn.classList.add("MattermostUno-counterDescriptionOn");
    const $counterDescriptionOnText = document.createTextNode("View thread");
    $counterDescriptionOn.appendChild($counterDescriptionOnText);
    $counterDescription.appendChild($counterDescriptionOn);
    $counter.appendChild($counterDescription);

    const $counterIcon = document.createElement("i");
    $counterIcon.classList.add("fa", "fa-arrow-right", "MattermostUno-counterIcon");
    $counter.appendChild($counterIcon);

    $rootPostContent.parentNode.appendChild($counter);
  });
}
