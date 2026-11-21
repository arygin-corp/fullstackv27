# gdx/settings/dev.py

import os

from .redis import configure_nonprod_redis

configure_nonprod_redis("dev")

from .base import *
from .runtime import *
from .storage import *


APP_ENV = "dev"

DEBUG = os.getenv(
    "DJANGO_DEBUG",
    "true",
).lower() == "true"

ALLOWED_HOSTS = merge_env_csv(
    ["admin.dev.data.toyota.com"],
    "DJANGO_ALLOWED_HOSTS",
)

CSRF_TRUSTED_ORIGINS = merge_env_csv(
    ["https://admin.dev.data.toyota.com"],
    "DJANGO_CSRF_TRUSTED_ORIGINS",
)

CORS_ALLOWED_ORIGINS = [
    "https://dev.data.toyota.com",
]

SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", False)

SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", True)
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", True)

MICROSOFT["logout_uri"] = (
    "https://admin.dev.data.toyota.com/logout"
)
