# gdx/settings/dev.py

import os

from .base import *
from .runtime import *
from .storage import *


APP_ENV = "dev"

DEBUG = os.getenv(
    "DJANGO_DEBUG",
    "true",
).lower() == "true"

ALLOWED_HOSTS = [
    "admin.dev.data.toyota.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://admin.dev.data.toyota.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://dev.data.toyota.com",
]

SECURE_SSL_REDIRECT = False

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

MICROSOFT["logout_uri"] = (
    "https://admin.dev.data.toyota.com/logout"
)
