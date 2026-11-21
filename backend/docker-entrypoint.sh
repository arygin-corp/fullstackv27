#!/bin/sh
set -eu

mkdir -p "${PROMETHEUS_MULTIPROC_DIR:-/tmp/prometheus_multiproc}"
rm -f "${PROMETHEUS_MULTIPROC_DIR:-/tmp/prometheus_multiproc}"/* 2>/dev/null || true

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  python manage.py migrate --noinput
fi

if [ "${COLLECT_STATIC:-true}" = "true" ]; then
  python manage.py collectstatic --noinput
fi

exec "$@"
