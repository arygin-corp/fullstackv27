#!/bin/sh
set -eu
exec celery -A gdx.celery_app:app beat --loglevel="${CELERY_LOG_LEVEL:-INFO}"
