import json
import os


def _setting(*names: str) -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value
    raise KeyError(names[0])


def _database_password() -> str:
    raw = _setting("DB_PASSWORD", "DATABASE_PASSWORD")
    if raw.startswith("{"):
        password = json.loads(raw).get("password")
        if isinstance(password, str) and password:
            return password
    return raw


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _setting("DB_NAME", "DATABASE_NAME"),
        "USER": _setting("DB_USER", "DATABASE_USER"),
        "PASSWORD": _database_password(),
        "HOST": _setting("DB_HOST", "DATABASE_HOST"),
        "PORT": os.getenv("DB_PORT") or os.getenv("DATABASE_PORT") or "5432",
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
        "OPTIONS": {"sslmode": os.getenv("DB_SSLMODE", "require")},
    }
}

REDIS_URL = os.environ["REDIS_URL"]
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    },
    "select2": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "select2-cache",
    },
}
SELECT2_CACHE_BACKEND = "select2"

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "django-db")
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = False
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
