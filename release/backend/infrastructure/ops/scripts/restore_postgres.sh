#!/bin/sh
set -eu
: "${DB_HOST:?}" "${DB_NAME:?}" "${DB_USER:?}" "${BACKUP_FILE:?}"
pg_restore --list "$BACKUP_FILE" >/dev/null
pg_restore --clean --if-exists --no-owner --host="$DB_HOST" --port="${DB_PORT:-5432}" --username="$DB_USER" --dbname="$DB_NAME" "$BACKUP_FILE"
echo "restore_completed=$DB_NAME"
