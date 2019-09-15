const { parser } = require("keep-a-changelog");
const { readFileSync, writeFileSync } = require("fs");

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const changelog = parser(readFileSync("./CHANGELOG.md", "UTF-8"));

let source = "";
changelog.releases[0].changes.forEach((changes, key) => {
  if (changes.length === 0) return;

  if (source.length !== 0) source += "\n";
  source += `### ${capitalize(key)}\n\n`;
  source += changes.reduce((prev, change) => `${prev}${change}\n`, "");
});

const uriStart = "https://github.com/ivangabriele/mattermost-browser-extension/releases/download";
const uriEnd = "/mattermost-uno-unsigned.zip";
const sourceWithLink = `${source.trim()}

---

- [Download Unsigned Browser Extension](${uriStart}/v${process.env.npm_package_version}${uriEnd})`;

writeFileSync("./RELEASE_NOTES.md", sourceWithLink, "utf8");
