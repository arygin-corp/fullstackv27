"""Save AI question and phrase searches without replacing an earlier training."""

import json
import re
import threading
from datetime import datetime, timezone
from pathlib import Path

_LOCK = threading.Lock()


def training_directory():
    return Path(__file__).resolve().parents[2] / "assets" / "json" / "training"


def record_training(query, normalized_query, bundle):
    text = (query or "").strip()
    key = (normalized_query or "").strip()
    if not text or not key:
        return
    try:
        with _LOCK:
            _append(text, key, bundle or {})
    except Exception:
        return


def _append(query, normalized_query, bundle):
    root = training_directory()
    root.mkdir(parents=True, exist_ok=True)
    path = _path_for(root, normalized_query)
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            payload = None
        if not isinstance(payload, dict) or _same_training(payload, normalized_query) is False:
            path = _fresh_path(root, _slug(normalized_query))
            payload = None
    else:
        payload = None
    if payload is None:
        payload = {
            "training": query,
            "normalized": normalized_query,
            "kind": _kind(query),
            "trainings": [],
        }
    trainings = payload.get("trainings")
    if not isinstance(trainings, list):
        trainings = []
    trainings.append(_example(query, bundle))
    payload["trainings"] = trainings
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    temporary.replace(path)


def _path_for(root, normalized_query):
    slug = _slug(normalized_query)
    direct = root / f"{slug}.json"
    candidates = [direct, *sorted(root.glob(f"{slug}-*.json"))]
    for path in candidates:
        if not path.is_file():
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(payload, dict) and _same_training(payload, normalized_query):
            return path
    if not direct.exists():
        return direct
    return _fresh_path(root, slug)


def _fresh_path(root, slug):
    number = 2
    while (root / f"{slug}-{number}.json").exists():
        number += 1
    return root / f"{slug}-{number}.json"


def _same_training(payload, normalized_query):
    stored = str(payload.get("normalized") or payload.get("training") or "")
    from .hybrid_search import normalize_query
    return normalize_query(stored) == normalized_query


def _slug(normalized_query):
    slug = re.sub(r"[^a-z0-9]+", "-", normalized_query).strip("-")
    return (slug or "training")[:80]


def _kind(query):
    from .ai_catalog import is_question
    return "question" if is_question(query) else "phrase"


def _example(query, bundle):
    results = []
    for item in bundle.get("results") or []:
        if not isinstance(item, dict):
            continue
        results.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "slug": item.get("slug"),
            "sku": item.get("sku"),
            "relevance_score": item.get("relevance_score"),
            "highlights": item.get("highlights") or [],
        })
    return {
        "trained_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "query": query,
        "search_query_used": bundle.get("search_query_used") or "",
        "result_count": len(results),
        "results": results,
    }
