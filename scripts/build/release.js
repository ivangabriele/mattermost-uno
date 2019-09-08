const archiver = require("archiver");
const { execSync } = require("child_process");
const { createWriteStream, writeFileSync } = require("fs");
const numeral = require("numeral");
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

const archiveOutput = createWriteStream(`./mattermost-uno-chrome-extension-${newVersion}.zip`);
const archive = archiver("zip", { zlib: { level: 9 } });

// Listen for all archive data to be written:
// The 'close' event is fired only when a file descriptor is involved.
archiveOutput.on("close", () => {
  console.info(`Archive size: ${numeral(archive.pointer()).format("0.00 b")}.`);
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
archiveOutput.on("end", () => console.warn("Warning: Data has been drained"));

archive.on("error", err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
archive.on("warning", err => {
  if (err.code === "ENOENT") {
    console.warn(`Warning: ${err.message}`);
  } else {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});

archive.pipe(archiveOutput);
archive.glob("**", { cwd: "./dist" });
archive.finalize();
