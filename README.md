# Mattermost Uno

[![Latest Version][img-version]][link-version]
[![Travis CI Status][img-travis]][link-travis]
[![Chrome Users][img-chrome]][link-chrome]
[![Firefox Users][img-firefox]][link-firefox]

Unofficial Chrome & Firefox extension bringing some Slack-like features into
[Mattermost][link-mattermost].

## Links

- [Chrome Extension][link-chrome]
- [Firefox Extension][link-firefox]

## Features

- Hide posts replies.
- Inject a Slack-like block under the posts containing replies.
- Infinite scroll.

## Screenshots

### Replies Block _(Default Theme)_

![Mattermost Default Theme Users][img-screenshot-1]

### Replies Block _(Dark Theme)_

![Mattermost Dark Theme][img-screenshot-2]

## Roadmap

- Live extension counter.
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
npm version [MINOR|PATCH]
```

1. The new Git tag will be pushed to Github.
2. Travis CI will test, build and publish the new release.

---

[img-chrome]: https://img.shields.io/chrome-web-store/users/fmlacedjkenmgemhjlljfkeckhbjjilc?label=Chrome%20users&style=flat-square
[img-firefox]: https://img.shields.io/amo/users/mattermost-uno?label=Firefox%20users&style=flat-square
[img-screenshot-1]: https://github.com/ivangabriele/mattermost-uno/raw/master/docs/screenshots/browser-1.png
[img-screenshot-2]: https://github.com/ivangabriele/mattermost-uno/raw/master/docs/screenshots/browser-2.png
[img-travis]: https://img.shields.io/travis/com/ivangabriele/mattermost-uno?style=flat-square
[img-version]: https://img.shields.io/github/package-json/v/ivangabriele/mattermost-uno?style=flat-square

[link-chrome]: https://chrome.google.com/webstore/detail/mattermost-uno/fmlacedjkenmgemhjlljfkeckhbjjilc
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/mattermost-uno/
[link-license]: https://github.com/ivangabriele/mattermost-uno/blob/master/LICENSE
[link-mattermost]: https://mattermost.com
[link-travis]: https://travis-ci.com/ivangabriele/mattermost-uno
[link-version]: https://github.com/ivangabriele/mattermost-uno/releases
