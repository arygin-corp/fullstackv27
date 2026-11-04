"use strict";
const { existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const backend = path.join(root, "backend");
const allowed = new Set(["local", "dev", "demo", "qa", "stage", "prod"]);
const environment = process.argv[2];
const extra = process.argv.slice(3);
const pythonPath = process.platform === "win32"
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const python = existsSync(pythonPath) ? pythonPath : (process.platform === "win32" ? "python" : "python3");

if (!allowed.has(environment)) process.exit(2);
if (!existsSync(path.join(backend, "gdx", "asgi.py"))) process.exit(1);

const args = [
  "-m", "uvicorn", "gdx.asgi:application",
  "--host", process.env.ASGI_HOST || "0.0.0.0",
  "--port", process.env.ASGI_PORT || "8000",
  "--workers", process.env.ASGI_WORKERS || "1",
  ...extra,
];

const result = spawnSync(python, args, {
  cwd: backend,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    APP_ENV: environment,
    DJANGO_SETTINGS_MODULE: `gdx.settings.${environment}`,
    PYTHONUNBUFFERED: "1",
  },
});
process.exit(result.status ?? 1);
