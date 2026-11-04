"use strict";
const { rmSync } = require("fs");
const path = require("path");
const root = process.cwd();
for (const directory of ["release", path.join("frontend", "dist")]) {
  rmSync(path.join(root, directory), { recursive: true, force: true });
}
console.log("Removed generated release and frontend dist directories.");
