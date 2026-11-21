#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(sys.argv[1] if len(sys.argv)>1 else ".")
skip={".git",".venv","venv","node_modules","__pycache__"}
patterns=[re.compile(x,re.I) for x in [r'BASE_DIR\s*/\s*["\']data',r'Path\([^)]*["\']data',r'open\([^)]*["\']data/',r'["\']data/']]
hits=[]
for p in root.rglob("*.py"):
    if any(part in skip for part in p.parts): continue
    for n,line in enumerate(p.read_text(errors="ignore").splitlines(),1):
        if any(rx.search(line) for rx in patterns): hits.append(f"{p}:{n}:{line.strip()}")
print("\n".join(hits))
raise SystemExit(1 if hits else 0)
