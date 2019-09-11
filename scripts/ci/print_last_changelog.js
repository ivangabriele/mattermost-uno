const { parser } = require("keep-a-changelog");
const { readFileSync } = require("fs");

const changelog = parser(readFileSync("./CHANGELOG.md", "UTF-8"));

let source = "";
changelog.releases[0].changes.forEach((changes, key) => {
  if (changes.length === 0) return;

  if (source.length !== 0) source += "\n";
  source += `### ${key.toUpperCase()}\n\n`;
  source += changes.reduce((prev, change) => `${prev}${change}\n`, "");
});

console.info(source.trim());
