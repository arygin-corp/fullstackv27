#!/usr/bin/env sh
set -eu

: "${DJANGO_SETTINGS_MODULE:?Set DJANGO_SETTINGS_MODULE to your project settings module}"

python -m compileall -q apps/marketplace
ruff check apps/marketplace
black --check apps/marketplace
python manage.py makemigrations marketplace --check --dry-run
python manage.py migrate marketplace --plan
python manage.py test apps.marketplace.tests
python manage.py check --deploy
