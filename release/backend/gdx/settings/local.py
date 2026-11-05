# gdx/settings/local.py
import os
from pathlib import Path
from dotenv import load_dotenv

from .base import *

# Load backend/.env for localhost development
load_dotenv(BASE_DIR / ".env")

APP_ENV = "local"
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:4200",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]

# ------------------------------------------------------------------
# Local database
# ------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ.get("DB_PORT", "5432"),
        "DISABLE_SERVER_SIDE_CURSORS": True,
        "CONN_MAX_AGE": 0,
        "OPTIONS": {
            "sslmode": "require",
        },
    }
}

# ------------------------------------------------------------------
# Local cache
# ------------------------------------------------------------------

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "local-cache",
    },
    "select2": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "select2-cache",
    },
}

SELECT2_CACHE_BACKEND = "select2"

# ------------------------------------------------------------------
# Local Celery
# ------------------------------------------------------------------

if DEBUG:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

# ------------------------------------------------------------------
# Local file storage
# ------------------------------------------------------------------

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# ------------------------------------------------------------------
# Local security
# ------------------------------------------------------------------

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# ------------------------------------------------------------------
# Local email
# ------------------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"