const { execSync } = require("child_process");
const { writeFileSync } = require("fs");

const manifestSource = require("../../manifest.json");

const newVersion = process.env.npm_package_version;

manifestSource.version = newVersion;
writeFileSync("./manifest.json", `${JSON.stringify(manifestSource, null, 2)}\n`);

execSync(`git add ./manifest.json`);
