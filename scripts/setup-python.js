"use strict";
const { existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");
const root = process.cwd();
const requirements = path.join(root, "backend", "requirements.txt");
const venv = path.join(root, ".venv");
function run(command, args) { const r = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" }); if (r.status !== 0) process.exit(r.status ?? 1); }
function findPython() {
  const candidates = process.platform === "win32" ? [["py", ["-3"]], ["python", []]] : [["python3", []], ["python", []]];
  for (const [command, prefix] of candidates) { const p = spawnSync(command, [...prefix, "--version"], { stdio: "ignore", shell: process.platform === "win32" }); if (p.status === 0) return [command, prefix]; }
  throw new Error("Python 3 was not found on PATH.");
}
try {
  if (!existsSync(requirements)) throw new Error("Missing backend/requirements.txt.");
  const [systemPython, prefix] = findPython();
  if (!existsSync(venv)) run(systemPython, [...prefix, "-m", "venv", venv]);
  const python = process.platform === "win32" ? path.join(venv, "Scripts", "python.exe") : path.join(venv, "bin", "python");
  run(python, ["-m", "pip", "install", "--upgrade", "pip"]);
  run(python, ["-m", "pip", "install", "-r", requirements]);
  const asgiRequirements = path.join(root, "backend", "requirements.asgi.txt");
  if (existsSync(asgiRequirements)) run(python, ["-m", "pip", "install", "-r", asgiRequirements]);
} catch (error) { console.error(error.message); process.exit(1); }
