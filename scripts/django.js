"use strict";
const { existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");
const root = process.cwd();
const backend = path.join(root, "backend");
const allowed = new Set(["local", "dev", "demo", "qa", "stage", "prod"]);
const action = process.argv[2];
const environment = process.argv[3];
const extraArgs = process.argv.slice(4);
const venvPython = process.platform === "win32" ? path.join(root, ".venv", "Scripts", "python.exe") : path.join(root, ".venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : (process.platform === "win32" ? "python" : "python3");
if (!allowed.has(environment)) { console.error("Environment must be local, dev, demo, qa, stage, or prod."); process.exit(2); }
if (!existsSync(path.join(backend, "manage.py"))) { console.error("Missing backend/manage.py."); process.exit(1); }
const env = { ...process.env, APP_ENV: environment, DJANGO_SETTINGS_MODULE: `gdx.settings.${environment}`, PYTHONUNBUFFERED: "1" };
function run(command, args) { const r=spawnSync(command,args,{cwd:backend,stdio:"inherit",shell:process.platform==="win32",env}); process.exitCode=r.status??1; return r.status===0; }
if (action === "run") run(python,["manage.py",...extraArgs]);
else if (action === "check") run(python,["manage.py","check",...(environment === "prod" ? ["--deploy"] : [])]);
else if (action === "collectstatic") run(python,["manage.py","collectstatic","--noinput"]);
else if (action === "migrate") run(python,["manage.py","migrate","--noinput"]);
else if (action === "wsgi") {
  const bind=process.env.GUNICORN_BIND||"0.0.0.0:8000";
  const workers=process.env.GUNICORN_WORKERS||"3";
  const timeout=process.env.GUNICORN_TIMEOUT||"120";
  run(python,["-m","gunicorn","gdx.wsgi:application","--bind",bind,"--workers",workers,"--timeout",timeout,...extraArgs]);
} else { console.error("Action must be run, check, collectstatic, migrate, or wsgi."); process.exit(2); }
