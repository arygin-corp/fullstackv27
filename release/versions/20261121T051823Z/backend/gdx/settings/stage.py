# gdx/settings/stage.py

from .redis import configure_nonprod_redis

configure_nonprod_redis("stage")

from .base import *
from .runtime import *
from .storage import *

APP_ENV = "stage"

DEBUG = False

ALLOWED_HOSTS = merge_env_csv(
    ["admin.stage.data.toyota.com"],
    "DJANGO_ALLOWED_HOSTS",
)

CSRF_TRUSTED_ORIGINS = merge_env_csv(
    ["https://admin.stage.data.toyota.com"],
    "DJANGO_CSRF_TRUSTED_ORIGINS",
)

CORS_ALLOWED_ORIGINS = [
    "https://stage.data.toyota.com",
]

SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)

SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", True)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", True)
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

MICROSOFT["logout_uri"] = (
    "https://admin.stage.data.toyota.com/logout"
)