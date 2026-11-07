#!/bin/sh
set -eu
: "${DB_HOST:?}" "${DB_NAME:?}" "${DB_USER:?}" "${BACKUP_FILE:?}"
pg_dump --format=custom --no-owner --host="$DB_HOST" --port="${DB_PORT:-5432}" --username="$DB_USER" --file="$BACKUP_FILE" "$DB_NAME"
pg_restore --list "$BACKUP_FILE" >/dev/null
echo "backup_verified=$BACKUP_FILE"
