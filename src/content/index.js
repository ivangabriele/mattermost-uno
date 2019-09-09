import { findIndex, propEq } from "ramda";

import e from "./helpers/e";
import isColorLight from "./helpers/isColorLight";
import stripHtmlTags from "./helpers/stripHtmlTags";
import themize from "./helpers/themize";
import waitFor from "./helpers/waitFor";
import updateCounters from "./libs/updateCounters";

import { CHANNEL_MESSAGE } from "../constants";

const FAST_LOOP_DELAY = 400;
const INFINITE_SCROLL_HEIGHT = 360;
const LOOP_DELAY = 1000;

let $postList = null;
let connection;
let loopId = -1;
let previousFirstPostId = "";
let previousLastPostId = "";
let previousLocationPath = "";
let rootPostsWithReplies = [];
let themeHref = "";

const findPostIndexWithId = id => findIndex(propEq("id", id))(rootPostsWithReplies);
const findPostIndexWithTheme = theme => findIndex(propEq("theme", theme))(rootPostsWithReplies);

function watchPostListScroll() {
  if (this.scrollTop > INFINITE_SCROLL_HEIGHT) return;

  const $loadMoreMessagesButton = document.querySelector("button.more-messages-text");
  if ($loadMoreMessagesButton !== null) $loadMoreMessagesButton.click();
}

// If the location path has changed:
window.addEventListener(
  "hashchange",
  () => {
    // And the a loop is in progress, we clear it:
    if (loopId !== -1) window.clearTimeout(loopId);
  },
  false
);

/**
 * TODO Get rid of the dirty retry hack.
 * TODO Try to discover a way to handle non-related replies declared as related ones.
 * TODO Handle posts cache deletion case.
 */
async function loop() {
  let $posts = [];
  let retries = 10;

  while ($posts.length === 0 && retries-- > 0) {
    $posts = document.querySelectorAll(".post-list-holder-by-time .post");

    // eslint-disable-next-line no-await-in-loop
    await waitFor(FAST_LOOP_DELAY);
  }

  if ($posts.length === 0 && retries === -1) {
    loopId = window.setTimeout(loop, LOOP_DELAY);

    return;
  }

  const firstPostId = $posts[0].id;
  const lastPostId = $posts[$posts.length - 1].id;

  // ------------------------------------
  // Location Path Change Detection

  // If the location path has changed:
  if (previousLocationPath !== window.location.pathname) {
    // And the first or last post id is the same,
    // we need to loop again because the new location path posts aren't loaded yet:
    if (firstPostId === previousFirstPostId || lastPostId === previousLastPostId) {
      loopId = window.setTimeout(loop, FAST_LOOP_DELAY);

      return;
    }

    rootPostsWithReplies = [];
    previousLocationPath = window.location.pathname;
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
    $postList = document.querySelector(".post-list-holder-by-time");
    $postList.addEventListener("scroll", watchPostListScroll);
  }

  // ------------------------------------
  // Posts Cache

  // If the posts list hasn't changed:
  if (firstPostId === previousFirstPostId && lastPostId === previousLastPostId) {
    // We tick:
    loopId = window.setTimeout(loop, LOOP_DELAY);

    return;
  }

  // If the posts list has changed, we cache the first and last one's id:
  previousFirstPostId = firstPostId;
  previousLastPostId = lastPostId;

  // ------------------------------------
  // Posts Parsing

  $posts.forEach($post => {
    // If this post is a reply to a root post:
    if ($post.classList.contains("post--comment")) {
      if (findPostIndexWithId($post.id) !== -1) return;

      const $postUserPicture = $post.querySelector("img.more-modal__image");
      if ($postUserPicture === null) return;

      const $postTime = $post.querySelector("time.post__time");
      if ($postTime === null) return;

      let rootPostIndex;
      if ($post.classList.contains("other--root")) {
        // If this post is a reply to a non-related previous root post:

        const $postMessage = $post.querySelector(".post__link > span > .theme");
        if ($postMessage === null) return;

        const theme = themize($postMessage.innerText);
        rootPostIndex = findPostIndexWithTheme(theme);
        if (rootPostIndex === -1) return;
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

      return;
    }

    const $rootPostCounter = $post.querySelector(".comment-count");

    // Id the counter node doesn't exist, it means that this root post doesn't have any reply.
    // We can ignore it:
    if ($rootPostCounter === null) return;

    const rootPostIndex = findPostIndexWithId($post.id);

    // If this root post is already in the list, we just need to update its counter:
    if (rootPostIndex !== -1) {
      rootPostsWithReplies[rootPostIndex].count = Number($rootPostCounter.innerText);

      return;
    }

    const $rootPostButtons = $post.querySelectorAll(".post__header--info button");
    if ($rootPostButtons.length === 0) return;

    const $rootPostMessage = $post.querySelector(".post-message__text");
    if ($rootPostMessage === null) return;

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

  // We updated the counter blocks nodes:
  try {
    updateCounters(rootPostsWithReplies);
  } catch (err) {
    e("Counter Updating", `Something went wrong.`);
    console.error(err);
  }

  loopId = window.setTimeout(loop, LOOP_DELAY);
}

const $mattermostMeta = document.querySelector(`meta[name="apple-mobile-web-app-title"]`);
if ($mattermostMeta !== null && $mattermostMeta.content === "Mattermost") {
  connection = chrome.runtime.connect({ name: "mattermost-uno" });
  connection.postMessage({ value: CHANNEL_MESSAGE.CONTENT_IS_MATTERMOST });

  loop();
}
