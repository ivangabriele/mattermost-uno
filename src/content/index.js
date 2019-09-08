import * as R from "ramda";

import e from "./helpers/e";
import isColorLight from "./helpers/isColorLight";
import removeNode from "./helpers/removeNode";
import stripHtmlTags from "./helpers/stripHtmlTags";
import themize from "./helpers/themize";
import waitFor from "./helpers/waitFor";
import updateCounters from "./libs/updateCounters";

function safelyRemovePostNode($post) {
  try {
    removeNode($post);
    // eslint-disable-next-line no-empty
  } catch (err) {}
}

const LOOP_DELAY = 1000;

const rootPostsWithReplies = [];
let $postList = null;
let previousFirstPostId = "";
let previousLastPostId = "";
let themeHref = "";

const findPostIndexWithId = id => R.findIndex(R.propEq("id", id))(rootPostsWithReplies);
const findPostIndexWithTheme = theme => R.findIndex(R.propEq("theme", theme))(rootPostsWithReplies);

/**
 * TODO Get rid of the dirty retry hack.
 * TODO Try to discover a way to handle non-related replies declared as related ones.
 * TODO Handle posts cache deletion case.
 */
async function run() {
  let $posts = [];
  let retries = 10;

  while ($posts.length === 0 && retries-- > 0) {
    $posts = document.querySelectorAll(".post-list-holder-by-time .post");

    // eslint-disable-next-line no-await-in-loop
    await waitFor(400);
  }

  if ($posts.length === 0 && retries === -1) {
    setTimeout(run, LOOP_DELAY);

    return;
  }

  // ------------------------------------
  // Theme

  const $theme = document.querySelector("link.code_theme");
  // If the theme has changed:
  if ($theme !== null && $theme.href !== themeHref) {
    themeHref = $theme.href;
    const $appContent = document.querySelector(".app__content");

    if ($appContent !== null) {
      const appContentBackgroundColor = window
        .getComputedStyle($appContent, null)
        .getPropertyValue("background-color");

      const themeIsLight = isColorLight(appContentBackgroundColor);
      const className = "MattermostUno--dark";
      const bodyHasDarkThemeClass = document.body.classList.contains(className);

      if (themeIsLight && bodyHasDarkThemeClass) document.body.classList.remove(className);
      if (!themeIsLight && !bodyHasDarkThemeClass) document.body.classList.add(className);
    }
  }

  // ------------------------------------
  // Infinite Scroll

  const $newPostList = document.querySelector(".post-list-holder-by-time");
  // If the post list node has changed:
  if ($newPostList !== null && $newPostList !== $postList) {
    $postList = $newPostList;

    $postList.addEventListener("scroll", () => {
      if ($postList.scrollTop > 100) return;

      const $loadMoreMessagesButton = document.querySelector("button.more-messages-text");
      if ($loadMoreMessagesButton !== null) $loadMoreMessagesButton.click();
    });
  }

  // ------------------------------------
  // Posts Cache

  const firstPostId = $posts[0].id;
  const lastPostId = $posts[$posts.length - 1].id;
  // If the posts list hasn't changed:
  if (firstPostId === previousFirstPostId && lastPostId === previousLastPostId) {
    setTimeout(run, LOOP_DELAY);

    return;
  }
  previousFirstPostId = firstPostId;
  previousLastPostId = lastPostId;

  // ------------------------------------
  // Posts Parsing

  $posts.forEach($post => {
    // If this post is a reply to a root post:
    if ($post.classList.contains("post--comment")) {
      if (findPostIndexWithId($post.id) !== -1) return;

      // const $postUserPicture = $post.querySelector("img.more-modal__image");
      // if ($postUserPicture === null) {
      //   e("Posts Parsing", "I can't find the other root post reply user picture node.");
      //   safelyRemovePostNode($post);

      //   return;
      // }

      const $postTime = $post.querySelector("time.post__time");
      if ($postTime === null) {
        e("Posts Parsing", "I can't find the other root post reply time node.");
        safelyRemovePostNode($post);

        return;
      }

      let rootPostIndex;
      if ($post.classList.contains("other--root")) {
        // If this post is a reply to a non-related previous root post:

        const $postMessage = $post.querySelector(".post__link > span > .theme");
        if ($postMessage === null) {
          e("Posts Parsing", "I can't find the other root post reply message node.");
          safelyRemovePostNode($post);

          return;
        }

        const theme = themize($postMessage.innerText);
        rootPostIndex = findPostIndexWithTheme(theme);
        if (rootPostIndex === -1) {
          e("Posts Parsing", "I can't find the other root post index for this reply.");
          safelyRemovePostNode($post);

          return;
        }
      } else {
        // If this post is a reply to a related previous root post:

        rootPostIndex = rootPostsWithReplies.length - 1;
        if (rootPostIndex === -1) {
          e("Posts Parsing", "I can't find the same root post index for this reply.");
          safelyRemovePostNode($post);

          return;
        }
      }

      const parentRootPost = rootPostsWithReplies[rootPostIndex];
      // if (!parentRootPost.authors.includes($postUserPicture.src)) {
      //   parentRootPost.authors.push($postUserPicture.src);

      //   if (
      //     parentRootPost.authors.length > parentRootPost.count ||
      //     parentRootPost.authors.length > 5
      //   ) {
      //     parentRootPost.authors.shift();
      //   }
      // }
      parentRootPost.updatedAt = $postTime.dateTime;

      safelyRemovePostNode($post);

      return;
    }

    const $rootPostCounter = $post.querySelector(".comment-count");
    if ($rootPostCounter === null) return;

    const rootPostIndex = findPostIndexWithId($post.id);
    if (rootPostIndex !== -1) {
      rootPostsWithReplies[rootPostIndex].count = Number($rootPostCounter.innerText);

      return;
    }

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
      id: $post.id,
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
