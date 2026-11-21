import os

APP_VERSION = os.environ.get("APP_VERSION", "0.0.0.0")
APP_DISPLAY_VERSION = os.environ.get("APP_DISPLAY_VERSION", "0.0.0")
GIT_SHA = os.environ.get("GIT_SHA", "unknown")
IMAGE_DIGEST = os.environ.get("IMAGE_DIGEST", "unknown")
BUILD_TIMESTAMP = os.environ.get("BUILD_TIMESTAMP", "unknown")
DEPLOYMENT_TIMESTAMP = os.environ.get("DEPLOYMENT_TIMESTAMP", "unknown")
APP_ENV = os.environ.get("APP_ENV", "unknown")

def public_runtime_metadata() -> dict[str, str]:
    return {
        "version": APP_VERSION,
        "git_sha": GIT_SHA,
        "environment": APP_ENV,
        "build_timestamp": BUILD_TIMESTAMP,
        "deployment_timestamp": DEPLOYMENT_TIMESTAMP,
    }
