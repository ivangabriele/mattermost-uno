import * as R from "ramda";

import e from "./helpers/e";
import removeNode from "./helpers/removeNode";
import stripHtmlTags from "./helpers/stripHtmlTags";
import themize from "./helpers/themize";
import waitFor from "./helpers/waitFor";
import updateCounters from "./libs/updateCounters";

const LOOP_DELAY = 1000;

let previousLastPostId = "";

/**
 * TODO Get rid of the dirty retry hack.
 * TODO Try to discover a way to handle non-related replies declared as related ones.
 */
async function run() {
  let $posts = [];
  let retries = 10;

  while ($posts.length === 0 && retries-- > 0) {
    $posts = document.querySelectorAll(".post");

    // eslint-disable-next-line no-await-in-loop
    await waitFor(400);
  }

  if ($posts.length === 0 && retries === -1) {
    setTimeout(run, LOOP_DELAY);

    return;
  }

  const lastPostId = $posts[$posts.length - 1].id;
  if (lastPostId === previousLastPostId) {
    setTimeout(run, LOOP_DELAY);

    return;
  }
  previousLastPostId = lastPostId;

  // eslint-disable-next-line no-underscore-dangle
  const rootPostsWithReplies = [];
  const findPostIndexWithTheme = theme =>
    R.findIndex(R.propEq("theme", theme))(rootPostsWithReplies);

  $posts.forEach($post => {
    // If this post is a reply to a root post:
    if ($post.classList.contains("post--comment")) {
      const $postUserPicture = $post.querySelector("img.more-modal__image");
      if ($postUserPicture === null) {
        e("Posts Parsing", "I can't find the other root post reply user picture node.");

        return;
      }

      const $postTime = $post.querySelector("time.post__time");
      if ($postTime === null) {
        e("Posts Parsing", "I can't find the other root post reply time node.");

        return;
      }

      let rootPostIndex;
      if ($post.classList.contains("other--root")) {
        // If this post is a reply to a non-related previous root post:

        const $postMessage = $post.querySelector(".post__link > span > .theme");
        if ($postMessage === null) {
          e("Posts Parsing", "I can't find the other root post reply message node.");

          return;
        }

        const theme = themize($postMessage.innerText);
        rootPostIndex = findPostIndexWithTheme(theme);
        if (rootPostIndex === -1) {
          e("Posts Parsing", "I can't find the other root post index for this reply.");

          return;
        }
      } else {
        // If this post is a reply to a related previous root post:

        rootPostIndex = rootPostsWithReplies.length - 1;
        if (rootPostIndex === -1) {
          e("Posts Parsing", "I can't find the same root post index for this reply.");

          return;
        }
      }

      const parentRootPost = rootPostsWithReplies[rootPostIndex];
      if (!parentRootPost.authors.includes($postUserPicture.src)) {
        parentRootPost.authors.push($postUserPicture.src);

        if (
          parentRootPost.authors.length > parentRootPost.count ||
          parentRootPost.authors.length > 5
        ) {
          parentRootPost.authors.shift();
        }
      }
      parentRootPost.updatedAt = $postTime.dateTime;

      try {
        removeNode($post);
      } catch (err) {
        return;
      }

      return;
    }

    const $rootPostCounter = $post.querySelector(".comment-count");
    if ($rootPostCounter === null) return;

    const $rootPostButtons = $post.querySelectorAll(".post__header--info button");
    if ($rootPostButtons.length === 0) {
      e("Posts Parsing", "I can't find the root post button node.");

      return;
    }

    const $rootPostMessage = $post.querySelector(".post-message__text");
    if ($rootPostMessage === null) {
      e("Posts Parsing", "I can't find the root post message node.");

      return;
    }

    const postTheme = themize(stripHtmlTags($rootPostMessage.innerHTML));

    rootPostsWithReplies.push({
      $button: $rootPostButtons[$rootPostButtons.length - 1],
      $node: $post,
      authors: [],
      count: Number($rootPostCounter.innerText),
      updatedAt: 0,
      theme: postTheme
    });
  });

  updateCounters(rootPostsWithReplies);

  setTimeout(run, LOOP_DELAY);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message) {
    case "areYouThere":
      sendResponse(true);
      break;

    default:
      e("Message Listening", `I received an unknown message from the extension: ${message}`);
  }
});

run();
