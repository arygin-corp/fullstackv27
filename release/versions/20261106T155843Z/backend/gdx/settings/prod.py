# gdx/settings/prod.py

import os
from django.core.exceptions import ImproperlyConfigured
from .base import *
from .runtime import *
from .storage import *


APP_ENV = "prod"

DEBUG = False

ALLOWED_HOSTS = [
    "admin.data.toyota.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://admin.data.toyota.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://data.toyota.com",
]

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

USE_X_FORWARDED_HOST = True

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"

SECURE_HSTS_SECONDS = int(
    os.getenv(
        "SECURE_HSTS_SECONDS",
        "31536000",
    )
)

SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

X_FRAME_OPTIONS = "DENY"

MICROSOFT["logout_uri"] = (
    "https://admin.data.toyota.com/logout"
)


if not SECRET_KEY or SECRET_KEY == "dev-only-change-me":
    raise ImproperlyConfigured(
        "GDX_SECRET_KEY must be supplied through Secrets Manager"
    )

if not MONITORING_TOKEN:
    raise ImproperlyConfigured(
        "MONITORING_TOKEN must be supplied through Secrets Manager"
    )

if not AWS_STORAGE_BUCKET_NAME:
    raise ImproperlyConfigured(
        "AWS_STORAGE_BUCKET_NAME is required in production"
    )

if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "Explicit ALLOWED_HOSTS are required in production"
    )