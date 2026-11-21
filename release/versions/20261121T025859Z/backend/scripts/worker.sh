#!/bin/sh
set -eu
exec celery -A gdx.celery_app:app worker --loglevel="${CELERY_LOG_LEVEL:-INFO}"
