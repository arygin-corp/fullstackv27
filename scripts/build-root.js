"use strict";
const { existsSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");
const release = path.join(root, "release");
const target = process.argv[2];
const environment = process.argv[3];
const engineerFlag = process.argv.slice(4).find(value => value.startsWith("--engineer="));
const engineer = (engineerFlag?.slice("--engineer=".length) || process.env.BUILD_ENGINEER || "").trim();
if (engineer) process.env.BUILD_ENGINEER = engineer;
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
function dateVersion() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.BUILD_TZ || "America/Chicago",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type)?.value;
  const yy = value("year");
  const mm = value("month");
  const dd = value("day");
  if (!yy || !mm || !dd) throw new Error("Unable to format the build date as YY.MM.DD.");
  return `${yy}.${mm}.${dd}`;
}
function nextBackendBuild() {
  const statePath = path.join(backend, ".build-state.json");
  let state = {};
  if (existsSync(statePath)) {
    try { state = JSON.parse(readFileSync(statePath, "utf8")); }
    catch { throw new Error("Invalid JSON in backend/.build-state.json."); }
  }
  let buildId;
  if (environment === "prod") {
    const start = 100;
    const increment = 5;
    const current = Number(state.productionBuildNumber ?? start);
    const valid = Number.isInteger(current) && current >= start && (current - start) % increment === 0;
    if (!valid) throw new Error("Invalid productionBuildNumber in backend/.build-state.json.");
    const next = current + increment;
    state.productionBuildNumber = next;
    buildId = `build-${next}`;
  } else {
    state.nonProductionBuildNumbers = state.nonProductionBuildNumbers || {};
    const current = Number(state.nonProductionBuildNumbers[environment] || 0);
    if (!Number.isInteger(current) || current < 0) {
      throw new Error(`Invalid ${environment} build number in backend/.build-state.json.`);
    }
    const next = current + 1;
    state.nonProductionBuildNumbers[environment] = next;
    buildId = `${environment}-build-${next}`;
  }
  return { state, statePath, version: dateVersion(), buildId };
}
function buildBackend() {
  if (!environments.has(environment)) throw new Error("Backend environment must be local, dev, demo, qa, stage, or prod.");
  if (!existsSync(path.join(backend, "manage.py"))) throw new Error("Missing backend/manage.py.");
  const metadata = nextBackendBuild();
  writeFileSync(path.join(backend, "version.json"), `${JSON.stringify({
    version: metadata.version,
    buildId: metadata.buildId,
    environment,
    engineer: engineer?.trim() || "",
    timestamp: new Date().toISOString()
  }, null, 2)}\n`);
  console.log(`Version: ${metadata.version}`);
  console.log(`Build ID: ${metadata.buildId}`);
  const djangoEnv = {
    APP_ENV: environment,
    DJANGO_SETTINGS_MODULE: `gdx.settings.${environment}`,
    APP_DISPLAY_VERSION: metadata.version,
    APP_VERSION: metadata.version,
    APP_BUILD_ID: metadata.buildId
  };
  run(python, ["manage.py", "check", ...(environment === "prod" ? ["--deploy"] : [])], backend, djangoEnv);
  run(python, ["manage.py", "collectstatic", "--noinput"], backend, djangoEnv);
  const destination = prepare("backend");
  cpSync(backend, destination, {
    recursive: true,
    filter: source => {
      const excluded = ["__pycache__", ".env", "db.sqlite3", ".venv", ".pytest_cache", "media", "data", ".build-state.json"];
      return !excluded.some(item => source.split(path.sep).includes(item));
    }
  });
  writeFileSync(metadata.statePath, `${JSON.stringify(metadata.state, null, 2)}\n`);
  console.log(`Backend artifact: ${destination}`);
  saveVersion("backend", destination);
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
  if (!engineer) throw new Error('Engineer required. Use --engineer="Name" or BUILD_ENGINEER.');
  if (!existsSync(path.join(frontend, "package.json"))) throw new Error("Missing frontend/package.json.");
  if (!existsSync(path.join(frontend, "build", "build.js"))) throw new Error("Missing frontend/build/build.js.");
  run("npm", ["run", `build:${environment}`], frontend, { BUILD_ENGINEER: engineer });
  const output = angularOutputPath();
  if (!existsSync(output)) throw new Error(`Angular output not found at ${output}. Verify angular.json outputPath.`);
  publishFrontend(output);
  const destination = prepare("frontend");
  cpSync(output, destination, { recursive: true });
  console.log(`Saved on this machine: ${destination}`);
  saveVersion("frontend", output);
}
function saveVersion(kind, source) {
  const id = process.env.GDX_DEPLOYMENT_ID;
  if (!id || !existsSync(source)) return;
  const versionDir = path.join(release, "versions", id);
  const destination = path.join(versionDir, kind);
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(versionDir, { recursive: true });
  cpSync(source, destination, { recursive: true });
  const manifestPath = path.join(versionDir, "manifest.json");
  let manifest = {};
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { manifest = {}; }
  }
  manifest[kind] = true;
  const versionFile = kind === "frontend"
    ? (existsSync(path.join(source, "version.json")) ? path.join(source, "version.json") : path.join(source, "assets", "version.json"))
    : path.join(source, "version.json");
  if (existsSync(versionFile)) {
    try {
      const metadata = JSON.parse(readFileSync(versionFile, "utf8"));
      const versionKey = kind === "backend" ? "backendVersion" : "frontendVersion";
      const buildKey = kind === "backend" ? "backendBuildId" : "frontendBuildId";
      manifest[versionKey] = metadata.version || "";
      manifest[buildKey] = metadata.buildId || "";
      manifest.version = manifest[versionKey];
      manifest.buildId = manifest[buildKey];
    } catch { /* The version file is optional for rollback. */ }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const savedVersion = manifest[kind === "backend" ? "backendVersion" : "frontendVersion"] || manifest.version || id;
  const savedBuild = manifest[kind === "backend" ? "backendBuildId" : "frontendBuildId"] || manifest.buildId || "";
  console.log(`Version: ${savedVersion}`);
  if (savedBuild) console.log(`Build ID: ${savedBuild}`);
}
function publishFrontend(output) {
  const script = path.join(root, "scripts", "deploy-frontend-s3.py");
  console.log(`> ${python} ${script} ${output} ${environment}`);
  const result = spawnSync(python, [script, output, environment], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env
  });
  if (result.status === 0) return;
  const skipped = environment === "local" || process.env.GDX_SKIP_FRONTEND_S3 === "1";
  if (!skipped) {
    rmSync(output, { recursive: true, force: true });
    console.error("S3 publish failed. The Angular build was not saved on this machine.");
  }
  process.exit(result.status ?? 1);
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
