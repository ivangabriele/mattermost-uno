# Mattermost Uno Browser Extension

[![Latest Version][img-version]][link-version] [![Travis CI Status][img-travis]][link-travis]
[![Chrome Users][img-chrome]][link-chrome]

Unofficial browser extension bringing some Slack-like features into [Mattermost][link-mattermost].

## Usage

Once installed, just click the Mattermost Uno browser extension icon on each of your Mattermost chat
active tabs in order to enable it. You can also disable it by clicking it on.

## Links

- [Chrome Extension][link-chrome]

## Features

- Hide posts replies.
- Inject a Slack-like block under the posts containing replies.
- Infinite scroll.

## Roadmap

- Firefox extension.
- Live extension counter.
- Fix `Unchecked runtime.lastError` error.
- Experimental authors pictures in replies counter block.
- Customizable options.

## Contribute

### Get Started

```bash
yarn
yarn dev
```

Then load the `/dist` directory in your browser as an unpacked extension.

### Release

```bash
yarn release [major|minor|patch|premajor|preminor|prepatch|prerelease]
```

---

[img-chrome]:
  https://img.shields.io/chrome-web-store/users/fmlacedjkenmgemhjlljfkeckhbjjilc?label=Chrome%20users&style=flat-square
[img-travis]:
  https://img.shields.io/travis/com/ivangabriele/mattermost-browser-extension?style=flat-square
[img-version]:
  https://img.shields.io/github/package-json/v/ivangabriele/mattermost-browser-extension?style=flat-square
[link-chrome]:
  https://chrome.google.com/webstore/detail/mattermost-uno/fmlacedjkenmgemhjlljfkeckhbjjilc
[link-license]: https://github.com/ivangabriele/mattermost-browser-extension/blob/master/LICENSE
[link-mattermost]: https://mattermost.com
[link-travis]: https://travis-ci.com/ivangabriele/mattermost-browser-extension
[link-version]: https://github.com/ivangabriele/mattermost-browser-extension/releases
