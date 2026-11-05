# gdx/settings/demo.py

import os

from .base import *
from .runtime import *
from .storage import *


APP_ENV = "demo"

DEBUG = os.getenv(
    "DJANGO_DEBUG",
    "true",
).lower() == "true"

ALLOWED_HOSTS = [
    "admin.demo.data.toyota.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://admin.demo.data.toyota.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://demo.data.toyota.com",
]

SECURE_SSL_REDIRECT = False

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

MICROSOFT["logout_uri"] = (
    "https://admin.demo.data.toyota.com/logout"
)