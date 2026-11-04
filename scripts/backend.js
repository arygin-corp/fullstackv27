"use strict";
const { existsSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const root = process.cwd();
const backend = path.join(root, "backend");
const managePy = path.join(backend, "manage.py");
const venvPython = process.platform === "win32"
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : (process.platform === "win32" ? "python" : "python3");
if (!existsSync(managePy)) { console.error("Missing backend/manage.py. Drop the Django project contents into backend/."); process.exit(1); }
const args = process.argv.slice(2);
if (!args.length) { console.error("No Django management command supplied."); process.exit(2); }
const child = spawn(python, ["manage.py", ...args], { cwd: backend, stdio: "inherit", env: { ...process.env, PYTHONUNBUFFERED: "1" } });
child.on("error", error => { console.error(error.message); process.exit(1); });
child.on("exit", code => process.exit(code ?? 1));
["SIGINT", "SIGTERM"].forEach(signal => process.on(signal, () => { if (!child.killed) child.kill(signal); }));
