#!/usr/bin/env python3
"""Upload frontend/dist/edmp-gdx-client-app/browser to the environment S3 bucket."""

import mimetypes
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

REGIONS = {
    "local": "us-west-2",
    "demo": "us-west-2",
    "dev": "us-west-2",
    "qa": "us-west-2",
    "stage": "us-west-2",
    "prod": "us-east-1",
}
CONTENT_TYPES = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".map": "application/json",
    ".mjs": "text/javascript",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
}
FRESH = (
    "index.html",
    "manifest.webmanifest",
    "ngsw.json",
    "ngsw-worker.js",
    "safety-worker.js",
    "version.json",
    "worker-basic.min.js",
)
FRESH_CACHE = "no-cache, no-store, must-revalidate, max-age=0"


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: deploy-frontend-s3.py <browser-dist> <environment>")
    source = Path(sys.argv[1]).resolve()
    environment = sys.argv[2]
    if not source.is_dir():
        raise SystemExit(f"Angular build directory was not found: {source}")

    if environment == "local" or os.getenv("GDX_SKIP_FRONTEND_S3") == "1":
        print("Local builds stay on this machine. S3 upload skipped.")
        return

    bucket = os.getenv("AWS_FRONTEND_BUCKET", "").strip()
    if not bucket:
        raise SystemExit(f"No S3 bucket is configured for {environment}.")

    if "AWS_FRONTEND_PREFIX" in os.environ:
        prefix = os.environ["AWS_FRONTEND_PREFIX"].strip().strip("/")
    else:
        prefix = ""

    region = os.getenv("AWS_REGION", "").strip() or REGIONS.get(environment, "us-west-2")
    try:
        import boto3
    except ImportError as error:
        raise SystemExit("boto3 is required to upload the Angular app to S3.") from error

    client = boto3.client("s3", region_name=region)
    uploaded = set()
    files = sorted(path for path in source.rglob("*") if path.is_file())
    if not files:
        raise SystemExit(f"Angular build directory is empty: {source}")

    for path in files:
        relative = path.relative_to(source).as_posix()
        key = f"{prefix}/{relative}" if prefix else relative
        extra = {
            "ContentType": content_type(path),
            "CacheControl": cache_control(path.name),
        }
        if must_revalidate(path.name):
            extra["Expires"] = datetime(1970, 1, 1, tzinfo=timezone.utc)
        client.upload_file(str(path), bucket, key, ExtraArgs=extra)
        uploaded.add(key)

    removed = delete_stale(client, bucket, prefix, uploaded)
    destination = f"s3://{bucket}/{prefix}/" if prefix else f"s3://{bucket}/"
    print(f"Uploaded {len(uploaded)} files to {destination} ({region}). Removed {removed} stale files.")


def content_type(path):
    extra = CONTENT_TYPES.get(path.suffix.lower())
    if extra:
        return extra
    guessed = mimetypes.guess_type(path.name)[0]
    return guessed or "application/octet-stream"


def must_revalidate(name):
    lowered = name.lower()
    return (
        lowered in FRESH
        or lowered.startswith("ngsw")
        or lowered.startswith("safety-worker")
        or lowered.startswith("worker-basic")
    )


def cache_control(name):
    if must_revalidate(name):
        return FRESH_CACHE
    return "public, max-age=31536000, immutable"


def delete_stale(client, bucket, prefix, uploaded):
    if not prefix:
        return 0
    paginator = client.get_paginator("list_objects_v2")
    stale = []
    for page in paginator.paginate(Bucket=bucket, Prefix=f"{prefix}/"):
        for item in page.get("Contents", []):
            if item["Key"] not in uploaded:
                stale.append({"Key": item["Key"]})
    for start in range(0, len(stale), 1000):
        client.delete_objects(
            Bucket=bucket,
            Delete={"Objects": stale[start:start + 1000], "Quiet": True},
        )
    return len(stale)


if __name__ == "__main__":
    main()
