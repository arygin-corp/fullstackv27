#!/usr/bin/env python3
"""Restore a saved deployment. Angular is published to S3 before anything is saved locally."""

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "release"


def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: rollback-release.py <version-id> <backend|frontend|all> <environment>")
    version_id, scope, environment = sys.argv[1:]
    version = RELEASE / "versions" / version_id
    manifest_path = version / "manifest.json"
    if not manifest_path.is_file():
        raise SystemExit("That saved version could not be found.")
    import json
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    if scope in ("frontend", "all"):
        source = version / "frontend"
        if not manifest.get("frontend") or not source.is_dir():
            raise SystemExit("That version does not include the Angular application.")
        if environment != "local" and os.getenv("GDX_SKIP_FRONTEND_S3") != "1":
            script = ROOT / "scripts" / "deploy-frontend-s3.py"
            result = subprocess.run([sys.executable, str(script), str(source), environment], check=False)
            if result.returncode != 0:
                raise SystemExit("S3 publish failed. Nothing was restored on this machine.")
        _replace(source, RELEASE / "frontend")
        print(f"Saved on this machine: {RELEASE / 'frontend'}")

    if scope in ("backend", "all"):
        source = version / "backend"
        if not manifest.get("backend") or not source.is_dir():
            raise SystemExit("That version does not include the Python application.")
        _replace(source, RELEASE / "backend")
        print(f"Python files are ready: {RELEASE / 'backend'}")


def _replace(source, destination):
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)


if __name__ == "__main__":
    main()
