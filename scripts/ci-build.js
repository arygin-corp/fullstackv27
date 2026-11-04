"use strict";
const { spawnSync } = require("child_process");
const [target = "all", environment = "prod"] = process.argv.slice(2);
const args = ["scripts/build-root.js", target, environment];
const result = spawnSync("node", args, { stdio: "inherit", shell: process.platform === "win32", env: process.env });
process.exit(result.status ?? 1);
