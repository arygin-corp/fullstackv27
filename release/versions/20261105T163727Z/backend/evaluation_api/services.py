from pathlib import Path

import json
import os
import subprocess
import sys

from django.conf import settings


def get_project_root() -> Path:
    return Path(
        getattr(
            settings,
            "RAG_EVALUATION_PROJECT_ROOT",
            settings.BASE_DIR
        )
    )


def get_evaluation_root() -> Path:
    return Path(
        getattr(
            settings,
            "RAG_EVALUATION_DIR",
            get_project_root() / "evaluation"
        )
    )


def get_data_root() -> Path:
    return Path(
        getattr(
            settings,
            "RAG_EVALUATION_DATA_DIR",
            get_project_root() / "data"
        )
    )


def get_builder_path() -> Path:
    return Path(
        getattr(
            settings,
            "RAG_EVALUATION_BUILDER",
            get_project_root()
            / "build_rag_evaluation_all_formats.py"
        )
    )


def load_json(
        file_path: Path,
        default_value
):
    if not file_path.exists():
        return default_value

    try:

        with open(
                file_path,
                "r",
                encoding="utf-8"
        ) as f:

            return json.load(f)

    except Exception:

        return default_value


def get_status():
    evaluation_dir = get_evaluation_root()

    manifest = load_json(
        evaluation_dir / "manifest.json",
        {}
    )

    coverage = load_json(
        evaluation_dir / "reports" / "coverage.json",
        []
    )

    candidates = load_json(
        evaluation_dir / "candidates"
        / "all_sources.candidates.json",
        []
    )

    ground_truth = load_json(
        evaluation_dir / "ground_truth.json",
        []
    )

    source_count = len(coverage)

    covered_count = len(
        [
            x
            for x in coverage
            if str(
            x.get("status", "")
        ).startswith(
            (
                "covered",
                "source_only_covered"
            )
        )
        ]
    )

    coverage_percent = 0

    if source_count > 0:
        coverage_percent = round(
            (
                    covered_count
                    / source_count
            ) * 100,
            2
        )

    return {
        "ready": bool(
            len(ground_truth)
        ),
        "candidateCount": len(
            candidates
        ),
        "groundTruthCount": len(
            ground_truth
        ),
        "sourceCount": source_count,
        "coveredSourceCount": covered_count,
        "coveragePercent": coverage_percent,
        "dataDirectory": str(
            get_data_root()
        ),
        "evaluationDirectory": str(
            evaluation_dir
        ),
        "provider": manifest.get(
            "provider"
        ),
        "lastRun": manifest.get(
            "generated_at"
        )
    }


def get_coverage(
        limit=500
):
    coverage = load_json(
        get_evaluation_root()
        / "reports"
        / "coverage.json",
        []
    )

    return {
        "count": len(coverage),
        "results": coverage[:limit]
    }


def get_ground_truth(
        limit=100
):
    rows = load_json(
        get_evaluation_root()
        / "ground_truth.json",
        []
    )

    return {
        "count": len(rows),
        "results": rows[:limit]
    }


def build_evaluation(
        options: dict
):

