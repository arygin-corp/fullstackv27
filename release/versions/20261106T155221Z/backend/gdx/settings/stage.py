# gdx/settings/stage.py
from .base import *
from .runtime import *
from .storage import *

APP_ENV = "stage"

DEBUG = False

ALLOWED_HOSTS = [
    "admin.stage.data.toyota.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://admin.stage.data.toyota.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://stage.data.toyota.com",
]

SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

MICROSOFT["logout_uri"] = (
    "https://admin.stage.data.toyota.com/logout"
)