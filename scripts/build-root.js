"use strict";
const { existsSync, mkdirSync, rmSync, cpSync, readFileSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");
const release = path.join(root, "release");
const target = process.argv[2];
const environment = process.argv[3];
const engineerFlag = process.argv.slice(4).find(value => value.startsWith("--engineer="));
const engineer = engineerFlag?.slice("--engineer=".length) || process.env.BUILD_ENGINEER;
const environments = new Set(["local", "dev", "qa", "demo", "stage", "prod"]);
const venvPython = process.platform === "win32"
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : process.platform === "win32" ? "python" : "python3";

function run(command, args, cwd, extraEnv = {}) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd, stdio: "inherit", shell: process.platform === "win32",
    env: { ...process.env, ...extraEnv }
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function prepare(name) {
  const destination = path.join(release, name);
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  return destination;
}
function buildBackend() {
  if (!environments.has(environment)) throw new Error("Backend environment must be local, dev, demo, qa, stage, or prod.");
  if (!existsSync(path.join(backend, "manage.py"))) throw new Error("Missing backend/manage.py.");
  const djangoEnv = { APP_ENV: environment, DJANGO_SETTINGS_MODULE: `gdx.settings.${environment}` };
  run(python, ["manage.py", "check", ...(environment === "prod" ? ["--deploy"] : [])], backend, djangoEnv);
  run(python, ["manage.py", "collectstatic", "--noinput"], backend, djangoEnv);
  const destination = prepare("backend");
  cpSync(backend, destination, {
    recursive: true,
    filter: source => {
      const excluded = ["__pycache__", ".env", "db.sqlite3", ".venv", ".pytest_cache", "media", "data"];
      return !excluded.some(item => source.split(path.sep).includes(item));
    }
  });
  console.log(`Backend artifact: ${destination}`);
}
function angularOutputPath() {
  const angularJsonPath = path.join(frontend, "angular.json");
  if (!existsSync(angularJsonPath)) return path.join(frontend, "dist");
  try {
    const angular = JSON.parse(readFileSync(angularJsonPath, "utf8"));
    const defaultProject = angular.defaultProject || Object.keys(angular.projects || {})[0];
    const project = angular.projects?.[defaultProject];
    const outputPath = project?.architect?.build?.options?.outputPath || project?.targets?.build?.options?.outputPath;
    return outputPath ? path.resolve(frontend, outputPath) : path.join(frontend, "dist");
  } catch {
    return path.join(frontend, "dist");
  }
}
function buildFrontend() {
  if (!environments.has(environment)) throw new Error("Frontend environment must be local, dev, qa, demo, stage, or prod.");
  if (!engineer?.trim()) throw new Error('Engineer required. Use --engineer="Name" or BUILD_ENGINEER.');
  if (!existsSync(path.join(frontend, "package.json"))) throw new Error("Missing frontend/package.json.");
  if (!existsSync(path.join(frontend, "build", "build.js"))) throw new Error("Missing frontend/build/build.js.");
  run("npm", ["run", `build:${environment}`], frontend, { BUILD_ENGINEER: engineer.trim() });
  const output = angularOutputPath();
  if (!existsSync(output)) throw new Error(`Angular output not found at ${output}. Verify angular.json outputPath.`);
  const destination = prepare("frontend");
  cpSync(output, destination, { recursive: true });
  console.log(`Frontend artifact: ${destination}`);
}
try {
  mkdirSync(release, { recursive: true });
  if (target === "backend") buildBackend();
  else if (target === "frontend") buildFrontend();
  else if (target === "all") { buildBackend(); buildFrontend(); }
  else throw new Error("Usage: node scripts/build-root.js backend | frontend <env> | all <env>");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
