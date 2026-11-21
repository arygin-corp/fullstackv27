# gdx/settings/prod.py

import os
from django.core.exceptions import ImproperlyConfigured

# Prod runs in us-east-1. These defaults must not point at the us-west-2 resources.
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("AWS_STORAGE_BUCKET_NAME", "edmp-gdxp-admin-use1-s3-web")
os.environ.setdefault("DB_NAME", "edmp_gdxp_admin_prod_rds")
os.environ.setdefault("DB_USER", "Administrator")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_SSLMODE", "require")

from .redis import configure_prod_redis

configure_prod_redis()

from .base import *
from .runtime import *
from .storage import *


APP_ENV = "prod"

DEBUG = False

ALLOWED_HOSTS = merge_env_csv(
    ["admin.data.toyota.com"],
    "DJANGO_ALLOWED_HOSTS",
)

CSRF_TRUSTED_ORIGINS = merge_env_csv(
    ["https://admin.data.toyota.com"],
    "DJANGO_CSRF_TRUSTED_ORIGINS",
)

CORS_ALLOWED_ORIGINS = [
    "https://data.toyota.com",
]

SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

USE_X_FORWARDED_HOST = True

SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", True)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", True)
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
        "GDXP_SECRET_KEY must be supplied through Secrets Manager"
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