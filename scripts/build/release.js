const { execSync } = require("child_process");
const { writeFileSync } = require("fs");
const semver = require("semver");

const manifestSource = require("../../manifest.json");
const npmSource = require("../../package.json");

const VERSION_LEVELS = [
  "major",
  "minor",
  "patch",
  "premajor",
  "preminor",
  "prepatch",
  "prerelease"
];

if (process.argv.length < 3) throw new Error("Error: Too few arguments.");
if (process.argv.length > 3) throw new Error("Error: Too many arguments.");
const newVersionLevel = process.argv[2];
if (!VERSION_LEVELS.includes(newVersionLevel)) throw new Error("Error: Wrong version level.");

const newVersion = semver.inc(npmSource.version, newVersionLevel);
manifestSource.version = newVersion;
writeFileSync("./manifest.json", `${JSON.stringify(manifestSource, null, 2)}\n`);

execSync(`git add ./manifest.json && git commit -m "manifest: bump version to ${newVersion}"`);
execSync(`npm version ${newVersionLevel}`);
