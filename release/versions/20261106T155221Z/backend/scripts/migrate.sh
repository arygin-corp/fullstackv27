#!/bin/sh
set -eu
exec python manage.py migrate --noinput
