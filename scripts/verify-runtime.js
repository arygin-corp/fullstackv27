"use strict";
const { existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const backend = path.join(root, "backend");
const environment = process.argv[2] || "local";
const pythonPath = process.platform === "win32"
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const python = existsSync(pythonPath) ? pythonPath : (process.platform === "win32" ? "python" : "python3");
const result = spawnSync(python, ["-c", "import gdx.asgi, gdx.wsgi; print('runtime-ok')"], {
  cwd: backend,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {...process.env, APP_ENV: environment, DJANGO_SETTINGS_MODULE: `gdx.settings.${environment}`},
});
process.exit(result.status ?? 1);
