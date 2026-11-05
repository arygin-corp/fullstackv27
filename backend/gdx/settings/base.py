# gdx/settings/base.py
"""Base Django settings for GDXP Admin.

Environment-specific infrastructure values are injected by ECS/Infra-Live.
Secrets are injected from AWS Secrets Manager into the task environment.
Environment modules (demo/dev/qa/stage/prod) override only policy-level settings.
"""

import os
from pathlib import Path
from datetime import datetime, timezone
from django.core.exceptions import ImproperlyConfigured

from django.contrib.messages import constants as messages

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def env_int(name: str, default: int) -> int:
    return int(os.getenv(name, str(default)))


def env_float(name: str, default: float) -> float:
    return float(os.getenv(name, str(default)))


def env_csv(name: str, default: str = "") -> list[str]:
    return [
        value.strip()
        for value in os.getenv(name, default).split(",")
        if value.strip()
    ]


APP_ENV = os.getenv("APP_ENV", "local").strip().lower()

# ---------------------------------------------------------------------------
# Application release/version metadata
# ---------------------------------------------------------------------------

def _local_display_version() -> str:
    """Local display version as YY.MM.DD in America/Chicago."""
    from zoneinfo import ZoneInfo

    now = datetime.now(ZoneInfo("America/Chicago"))
    return now.strftime("%y.%m.%d")


if APP_ENV == "local":
    APP_DISPLAY_VERSION = os.getenv(
        "APP_DISPLAY_VERSION",
        _local_display_version(),
    )
else:
    APP_DISPLAY_VERSION = os.getenv(
        "APP_DISPLAY_VERSION",
        "",
    )

    if not APP_DISPLAY_VERSION:
        raise ImproperlyConfigured(
            "APP_DISPLAY_VERSION must be supplied "
            "by the deployment environment"
        )


APP_VERSION = os.getenv(
    "APP_VERSION",
    APP_DISPLAY_VERSION,
)

GIT_SHA = os.getenv(
    "GIT_SHA",
    "local",
)

IMAGE_DIGEST = os.getenv(
    "IMAGE_DIGEST",
    "local",
)

BUILD_TIMESTAMP = os.getenv(
    "BUILD_TIMESTAMP",
    "local",
)

DEPLOYMENT_TIMESTAMP = os.getenv(
    "DEPLOYMENT_TIMESTAMP",
    "local",
)

SECRET_KEY = os.getenv("GDX_SECRET_KEY", "dev-only-change-me")
DEBUG = env_bool("DJANGO_DEBUG", False)

# ---------------------------------------------------------------------------
# Core Django
# ---------------------------------------------------------------------------
ROOT_URLCONF = "gdx.urls"
# WSGI_APPLICATION = "gdx.wsgi.application"
ASGI_APPLICATION = "gdx.asgi.application"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Chicago"
USE_I18N = True
USE_TZ = True
SITE_ID = 1
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000

# ---------------------------------------------------------------------------
# Hosts / reverse proxy / HTTPS / cookies
# Values are supplied by Infra-Live for deployed environments.
# ---------------------------------------------------------------------------
ALLOWED_HOSTS = env_csv(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1",
)
CSRF_TRUSTED_ORIGINS = env_csv(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "http://localhost:8000",
)
CORS_ALLOWED_ORIGINS = env_csv(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    "http://localhost:4200",
)
CORS_ALLOW_CREDENTIALS = env_bool(
    "DJANGO_CORS_ALLOW_CREDENTIALS",
    True,
)
CORS_ALLOW_ALL_ORIGINS = False

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = env_bool("DJANGO_USE_X_FORWARDED_HOST", True)
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", False)
SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", False)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", False)
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------
MESSAGE_TAGS = {
    messages.DEBUG: "alert-info",
    messages.INFO: "alert-info",
    messages.SUCCESS: "alert-success",
    messages.WARNING: "alert-warning",
    messages.ERROR: "alert-danger",
}

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.sites",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_redis",
    "django_filters",
    "django_celery_results",
    "pgvector.django",
    "allauth",
    "allauth.account",
    "microsoft_authentication",
    "django_select2",
    "django_ckeditor_5",
    "django_json_widget",
    "widget_tweaks",
    "crispy_forms",
    "channels",
    "rest_framework",
    "evaluation_api",
    "apps.api",
    "apps.teams",
    "apps.notifications",
    "apps.marketplace",
    "apps.changelog",
    "apps.orders",
    "apps.third_party_apis.modules.product_intake.apps.ProductIntakeConfig",
    "apps.resources",
    "apps.forms",
    "apps.third_party_apis.modules.data_access_request.apps.DataAccessRequestConfig",
    "apps.suggestedAI",
    "apps.people",
    "apps.profiles",
    "apps.product_checkout",
    "apps.external_apis",
    "apps.third_party_apis.modules.vikki.chat",
    "apps.knowledge",
    "apps.workflow_engine",
    "apps.third_party_apis.modules.apify_platforms.apify_api",
    "apps.third_party_apis.modules.apify_platforms.audit",
    "apps.third_party_apis.modules.apify_platforms.platform",
    "apps.third_party_apis.modules.apify_platforms.tenancy",
    "apps.third_party_apis.apps.ThirdPartyApisConfig",
    "apps.third_party_apis.modules.aws.apps.AWSConfig",
    "apps.third_party_apis.modules.checkout",
    "apps.pages",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "gdx.maintenance.MaintenanceModeMiddleware",
    "apps.profiles.middleware.VerifiedStaffAccessMiddleware",
    "gdx.page_access.PageAccessMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "apps.external_apis.middleware.CorrelationIdMiddleware",
    "apps.changelog.middleware.AuditRequestMiddleware",
    "apps.notifications.monitoring.middleware.DatabaseQueryMetricsMiddleware",
    "apps.third_party_apis.modules.apify_platforms.platform.middleware.CatalogAccessMiddleware",
]
if env_bool("TENANT_HEADER_ENABLED", False):
    MIDDLEWARE.insert(
        1,
        "apps.notifications.tenancy_middleware.TenantContextMiddleware",
    )

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                # GDXP Admin display version
                "gdx.context_processors.site_identity",
                "gdx.context_processors.app_display_version",
                "gdx.context_processors.header_environment",
                "gdx.context_processors.header_notifications",
                "gdx.context_processors.header_account",
                "gdx.context_processors.staff_page_header",
            ],
        },
    },
]

# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "gdx.access.AccessTypePermissionBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]
LOGIN_URL = "/microsoft_authentication/login"
LOGIN_REDIRECT_URL = "/admin"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_METHODS = {"email", "username"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "username*", "password1*", "password2*"]

MICROSOFT = {
    "app_id": os.getenv("MICROSOFT_APP_ID", ""),
    "app_secret": os.getenv("MICROSOFT_APP_SECRET", ""),
    "redirect": os.getenv("MICROSOFT_REDIRECT_URL", ""),
    "scopes": ["User.Read", "User.ReadBasic.All"],
    "authority": os.getenv("MICROSOFT_AUTHORITY", ""),
    "valid_email_domains": ["toyota.com"],
    "logout_uri": os.getenv("MICROSOFT_LOGOUT_URI", "http://localhost:8000/logout",),
}
MICROSOFT_CREATE_NEW_DJANGO_USER = False
MICROSOFT_NEW_DJANGO_USER_IS_STAFF = False

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------------
# Static files. Media uploads stay on this machine in every environment.
# ---------------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "assets"
STATICFILES_DIRS = [BASE_DIR / "static"]

AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME", "")
AWS_S3_DATA_PREFIX = os.getenv("AWS_S3_DATA_PREFIX", "data").strip("/")

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

# Runtime code must use these S3 values instead of BASE_DIR / "data" in AWS.
DATA_S3_BUCKET = AWS_STORAGE_BUCKET_NAME
DATA_S3_PREFIX = AWS_S3_DATA_PREFIX

# ---------------------------------------------------------------------------
# Database
# One NonProd PostgreSQL database is shared by DEMO/DEV/QA/STAGE.
# Infra-Live injects the endpoint/name; Secrets Manager injects credentials.
# ---------------------------------------------------------------------------
DB_ENGINE = os.getenv("DB_ENGINE", "postgres")
if DB_ENGINE == "postgres":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "edmp_gdxp_admin_local"),
            "USER": os.getenv("DB_USER", "gdx_admin"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "db"),
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": env_int("DB_CONN_MAX_AGE", 60),
            "OPTIONS": {
                "sslmode": os.getenv(
                    "DB_SSLMODE",
                    "disable" if APP_ENV == "local" else "require",
                )
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ---------------------------------------------------------------------------
# Redis / Django cache / Celery runtime
# Redis is isolated per environment in AWS. Local defaults remain local-only.
# ---------------------------------------------------------------------------
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    },
    "select2": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "select2-cache",
    },
}
SELECT2_CACHE_BACKEND = "select2"

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "django-db")
CELERY_TASK_ALWAYS_EAGER = env_bool("CELERY_TASK_ALWAYS_EAGER", APP_ENV == "local")
CELERY_TASK_EAGER_PROPAGATES = env_bool(
    "CELERY_TASK_EAGER_PROPAGATES",
    APP_ENV == "local",
)
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = env_int("CELERY_TASK_TIME_LIMIT", 60)
CELERY_TASK_SOFT_TIME_LIMIT = env_int("CELERY_TASK_SOFT_TIME_LIMIT", 45)
CELERY_WORKER_PREFETCH_MULTIPLIER = env_int("CELERY_WORKER_PREFETCH_MULTIPLIER", 1)
CELERY_TIMEZONE = "UTC"

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
}

# ---------------------------------------------------------------------------
# CKEditor 5
# Uploaded files use Django's default storage (S3 in deployed environments).
# ---------------------------------------------------------------------------
CKEDITOR_5_UPLOAD_FILE_TYPES = ["jpeg", "png", "jpg", "gif", "pdf"]
CKEDITOR_5_UPLOAD_PATH = "uploads/"
CKEDITOR_5_ALLOW_ALL_FILE_TYPES = True
CKEDITOR_5_CONFIGS = {
    "default": {
        "toolbar": [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "imageUpload",
        ],
    },
    "extends": {
        "blockToolbar": [
            "paragraph",
            "heading1",
            "heading2",
            "heading3",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "blockQuote",
        ],
        "toolbar": [
            "heading", "|", "outdent", "indent", "|", "bold", "italic",
            "link", "underline", "strikethrough", "code", "subscript",
            "superscript", "highlight", "|", "codeBlock", "sourceEditing",
            "insertImage", "bulletedList", "numberedList", "todoList", "|",
            "blockQuote", "imageUpload", "|", "fontSize", "fontFamily",
            "fontColor", "fontBackgroundColor", "mediaEmbed", "removeFormat",
            "insertTable",
        ],
    },
}

# ---------------------------------------------------------------------------
# Email
# SES is intentionally out of scope; provider configuration is runtime-driven.
# ---------------------------------------------------------------------------
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = env_int("EMAIL_PORT", 587)
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@example.com")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", DEFAULT_FROM_EMAIL)

# ---------------------------------------------------------------------------
# Product / integration settings
# ---------------------------------------------------------------------------
PRODUCT_CHECKOUT_PRODUCT_MODEL = "marketplace.Product"
PRODUCT_CHECKOUT_PRODUCT_FIELDS = {
    "id": "pk",
    "name": "name",
    "description": "description",
    "platform": "platform",
    "classification": "classification",
    "domain": "onetsdomain",
    "environment": "env",
}
INTAKE_MEMBERSHIP_MANAGER_EMAILS = {
    email.casefold()
    for email in env_csv("INTAKE_MEMBERSHIP_MANAGER_EMAILS")
}

PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_ID = os.getenv(
    "PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_ID",
    "",
)
PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET = os.getenv(
    "PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET",
    "",
)
PEOPLEFINDER_MICROSOFT_AUTH_TENANT_ID = os.getenv("PEOPLEFINDER_MICROSOFT_AUTH_TENANT_ID", "",)

TDSP_PODS_USERNAME = os.getenv("TDSP_PODS_USERNAME", "")
TDSP_PODS_PASSWORD = os.getenv("TDSP_PODS_PASSWORD", "")
TDSP_PODS_URL = os.getenv("TDSP_PODS_URL", "https://tmna.service-now.com/api/now/table/",)
TDSP_PODS_TIMEOUT_SECONDS = env_int("TDSP_PODS_TIMEOUT_SECONDS", 15)
TDSP_PODS_CACHE_SECONDS = env_int("TDSP_PODS_CACHE_SECONDS", 300)
TDSP_PODS_MAX_RESULTS = env_int("TDSP_PODS_MAX_RESULTS", 1000)
TDSP_PODS_VERIFY_SSL = env_bool("TDSP_PODS_VERIFY_SSL", True)

MARKETPLACE_DENODO_MASTER = BASE_DIR / "static/json/marketplace/@denodo_master/@master-denodo.json"
MARKETPLACE_PRODUCT_MASTER = BASE_DIR / "static/json/marketplace/products/products.json"
MARKETPLACE_ORDER_MASTER = BASE_DIR / "static/json/marketplace/orders/@master-order.json"

# ---------------------------------------------------------------------------
# Notifications / schedules
# ---------------------------------------------------------------------------
NOTIFICATION_EVENT_PREFIX = os.getenv("NOTIFICATION_EVENT_PREFIX", "notifications:user")
NOTIFICATION_SSE_HEARTBEAT_SECONDS = env_int("NOTIFICATION_SSE_HEARTBEAT_SECONDS", 20)
NOTIFICATION_PAGE_SIZE = min(env_int("NOTIFICATION_PAGE_SIZE", 25), 100)
NOTIFICATIONS_CELERY_ENABLED = env_bool("NOTIFICATIONS_CELERY_ENABLED", False)
NOTIFICATIONS_REDIS_EVENTS_ENABLED = env_bool("NOTIFICATIONS_REDIS_EVENTS_ENABLED", False)
NOTIFICATIONS_REDIS_SSE_ENABLED = env_bool("NOTIFICATIONS_REDIS_SSE_ENABLED", False)
NOTIFICATION_PREFERENCES_ENABLED = env_bool("NOTIFICATION_PREFERENCES_ENABLED", True)

NOTIFICATION_READ_RETENTION_DAYS = env_int("NOTIFICATION_READ_RETENTION_DAYS", 90)
NOTIFICATION_UNREAD_RETENTION_DAYS = env_int("NOTIFICATION_UNREAD_RETENTION_DAYS", 180)
NOTIFICATION_DELETED_RETENTION_DAYS = env_int("NOTIFICATION_DELETED_RETENTION_DAYS", 30)
NOTIFICATION_ANALYTICS_ENABLED = env_bool("NOTIFICATION_ANALYTICS_ENABLED", True)

OUTBOX_BATCH_SIZE = env_int("OUTBOX_BATCH_SIZE", 100)
OUTBOX_MAX_ATTEMPTS = env_int("OUTBOX_MAX_ATTEMPTS", 5)
OUTBOX_RETRY_BASE_SECONDS = env_int("OUTBOX_RETRY_BASE_SECONDS", 30)
OUTBOX_RETRY_MAX_SECONDS = env_int("OUTBOX_RETRY_MAX_SECONDS", 3600)
OUTBOX_LOCK_TIMEOUT_SECONDS = env_int("OUTBOX_LOCK_TIMEOUT_SECONDS", 300)
CAMPAIGN_BATCH_SIZE = env_int("CAMPAIGN_BATCH_SIZE", 25)

CELERY_BEAT_SCHEDULE = {
    "notification-retention-daily": {
        "task": "apps.notifications.tasks.enforce_notification_retention",
        "schedule": 86400.0,
    },
    "notification-monitoring-every-minute": {
        "task": "apps.notifications.tasks.collect_notification_monitoring",
        "schedule": 60.0,
    },
    "notification-digests-hourly": {
        "task": "apps.notifications.tasks.build_notification_digests",
        "schedule": 3600.0,
    },
    "notification-outbox-every-10-seconds": {
        "task": "apps.notifications.tasks.process_outbox_batch",
        "schedule": 10.0,
    },
    "notification-outbox-lock-recovery": {
        "task": "apps.notifications.tasks.recover_stale_outbox_locks",
        "schedule": 60.0,
    },
    "notification-campaigns-every-minute": {
        "task": "apps.notifications.tasks.dispatch_scheduled_campaigns",
        "schedule": 60.0,
    },
    "notification-ai-daily-summary": {
        "task": "apps.notifications.tasks.generate_scheduled_notification_summaries",
        "schedule": 86400.0,
        "args": ["daily"],
    },
    "notification-ai-weekly-summary": {
        "task": "apps.notifications.tasks.generate_scheduled_notification_summaries",
        "schedule": 604800.0,
        "args": ["weekly"],
    },
    "notification-ledger-verification": {
        "task": "apps.notifications.tasks.verify_audit_ledger",
        "schedule": 3600.0,
    },
}

# ---------------------------------------------------------------------------
# Monitoring / tracing / alerts
# ---------------------------------------------------------------------------
MONITORING_TOKEN = os.getenv("MONITORING_TOKEN", "")
MONITORING_WINDOW_MINUTES = env_int("MONITORING_WINDOW_MINUTES", 15)
ALERT_CREATION_FAILURES = env_int("ALERT_CREATION_FAILURES", 5)
ALERT_REDIS_FAILURES = env_int("ALERT_REDIS_FAILURES", 3)
ALERT_CELERY_QUEUE_DEPTH = env_int("ALERT_CELERY_QUEUE_DEPTH", 100)
ALERT_TASK_RETRIES = env_int("ALERT_TASK_RETRIES", 10)
ALERT_DELIVERY_FAILURE_RATE = env_float("ALERT_DELIVERY_FAILURE_RATE", 0.10)
ALERT_SSE_CONNECTIONS = env_int("ALERT_SSE_CONNECTIONS", 100)
ALERT_DB_QUERY_SECONDS = env_float("ALERT_DB_QUERY_SECONDS", 0.25)
ALERT_UNPUBLISHED_AGE_SECONDS = env_int("ALERT_UNPUBLISHED_AGE_SECONDS", 300)
ALERT_OUTBOX_BACKLOG = env_int("ALERT_OUTBOX_BACKLOG", 100)
ALERT_DEAD_LETTERS_OPEN = env_int("ALERT_DEAD_LETTERS_OPEN", 1)

OTEL_ENABLED = env_bool("OTEL_ENABLED", False)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {"()": "apps.notifications.logging.JsonFormatter"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
}

# ---------------------------------------------------------------------------
# AI / RAG / storage providers
# ---------------------------------------------------------------------------
AI_SUMMARY_ENABLED = env_bool("AI_SUMMARY_ENABLED", True)
AI_SUMMARY_PROVIDER = os.getenv("AI_SUMMARY_PROVIDER", "deterministic")
AI_SUMMARY_ENDPOINT = os.getenv("AI_SUMMARY_ENDPOINT", "")
AI_SUMMARY_API_KEY = os.getenv("AI_SUMMARY_API_KEY", "")
AI_SUMMARY_MODEL = os.getenv("AI_SUMMARY_MODEL", "")
AI_SUMMARY_TIMEOUT_SECONDS = env_int("AI_SUMMARY_TIMEOUT_SECONDS", 15)
AI_SUMMARY_MAX_ITEMS = min(env_int("AI_SUMMARY_MAX_ITEMS", 100), 500)

AI_CHAT_PROVIDER = os.getenv("AI_CHAT_PROVIDER", "ollama")
AI_EMBEDDING_PROVIDER = os.getenv("AI_EMBEDDING_PROVIDER", "ollama")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.2")
OLLAMA_EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
EMBEDDING_DIMENSIONS = env_int("EMBEDDING_DIMENSIONS", 768)
RAG_TOP_K = env_int("RAG_TOP_K", 5)
RAG_MAX_CONTEXT_CHARS = env_int("RAG_MAX_CONTEXT_CHARS", 12000)
RAG_CHUNK_SIZE = env_int("RAG_CHUNK_SIZE", 1200)
RAG_CHUNK_OVERLAP = env_int("RAG_CHUNK_OVERLAP", 200)
RAG_RETRIEVAL_PROVIDER = os.getenv("RAG_RETRIEVAL_PROVIDER", "pgvector")

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")
AZURE_OPENAI_CHAT_DEPLOYMENT = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "")
AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "")
AZURE_OPENAI_USE_ENTRA_ID = env_bool("AZURE_OPENAI_USE_ENTRA_ID", True)

AZURE_AI_SEARCH_ENDPOINT = os.getenv("AZURE_AI_SEARCH_ENDPOINT", "")
AZURE_AI_SEARCH_INDEX = os.getenv("AZURE_AI_SEARCH_INDEX", "ai-chat-chunks")
AZURE_AI_SEARCH_API_KEY = os.getenv("AZURE_AI_SEARCH_API_KEY", "")
AZURE_AI_SEARCH_USE_ENTRA_ID = env_bool("AZURE_AI_SEARCH_USE_ENTRA_ID", True)

DOCUMENT_STORAGE_PROVIDER = os.getenv("DOCUMENT_STORAGE_PROVIDER", "s3" if AWS_STORAGE_BUCKET_NAME else "local")
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME", "")
AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER", "documents")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY", "")
AZURE_STORAGE_USE_ENTRA_ID = env_bool("AZURE_STORAGE_USE_ENTRA_ID", True)

RAG_EVALUATION_PROJECT_ROOT = BASE_DIR
RAG_EVALUATION_DIR = BASE_DIR / "evaluation"
RAG_EVALUATION_BUILDER = BASE_DIR / "build_rag_evaluation_all_formats.py"
RAG_EVALUATION_BUILD_TIMEOUT_SECONDS = env_int("RAG_EVALUATION_BUILD_TIMEOUT_SECONDS", 900)
RAG_EVALUATION_DATA_BUCKET = AWS_STORAGE_BUCKET_NAME
RAG_EVALUATION_DATA_PREFIX = AWS_S3_DATA_PREFIX

# ---------------------------------------------------------------------------
# Notification feature flags / push / tenancy / audit
# ---------------------------------------------------------------------------
EVENT_SOURCING_ENABLED = env_bool("EVENT_SOURCING_ENABLED", True)
EVENT_SOURCING_MAX_PAYLOAD_BYTES = env_int("EVENT_SOURCING_MAX_PAYLOAD_BYTES", 16384)
MOBILE_PUSH_ENABLED = env_bool("MOBILE_PUSH_ENABLED", False)
WEB_PUSH_ENABLED = env_bool("WEB_PUSH_ENABLED", False)
FCM_PUSH_ENABLED = env_bool("FCM_PUSH_ENABLED", False)
APNS_PUSH_ENABLED = env_bool("APNS_PUSH_ENABLED", False)
MOBILE_PUSH_INCLUDE_BODY = env_bool("MOBILE_PUSH_INCLUDE_BODY", False)
MOBILE_PUSH_TIMEOUT_SECONDS = env_int("MOBILE_PUSH_TIMEOUT_SECONDS", 10)
MOBILE_PUSH_DISABLE_AFTER_FAILURES = env_int("MOBILE_PUSH_DISABLE_AFTER_FAILURES", 3)
WEB_PUSH_VAPID_PRIVATE_KEY = os.getenv("WEB_PUSH_VAPID_PRIVATE_KEY", "")
WEB_PUSH_VAPID_SUBJECT = os.getenv("WEB_PUSH_VAPID_SUBJECT", "mailto:no-reply@example.com")
FCM_PUSH_ENDPOINT = os.getenv("FCM_PUSH_ENDPOINT", "")
FCM_PUSH_BEARER_TOKEN = os.getenv("FCM_PUSH_BEARER_TOKEN", "")
APNS_PUSH_ENDPOINT = os.getenv("APNS_PUSH_ENDPOINT", "")
APNS_PUSH_BEARER_TOKEN = os.getenv("APNS_PUSH_BEARER_TOKEN", "")

MULTI_TENANCY_ENABLED = env_bool("MULTI_TENANCY_ENABLED", False)
TENANT_HEADER_ENABLED = env_bool("TENANT_HEADER_ENABLED", False)
TENANT_SUBDOMAIN_ENABLED = env_bool("TENANT_SUBDOMAIN_ENABLED", False)
TENANT_API_KEYS_ENABLED = env_bool("TENANT_API_KEYS_ENABLED", False)
DEFAULT_TENANT_KEY = os.getenv("DEFAULT_TENANT_KEY", "default")
TENANT_HEADER_NAME = os.getenv("TENANT_HEADER_NAME", "X-Notification-Tenant")
APPLICATION_HEADER_NAME = os.getenv("APPLICATION_HEADER_NAME", "X-Notification-Application")
DYNAMIC_AUDIENCES_ENABLED = env_bool("DYNAMIC_AUDIENCES_ENABLED", True)
DYNAMIC_AUDIENCE_MAX_MEMBERS = min(env_int("DYNAMIC_AUDIENCE_MAX_MEMBERS", 10000), 100000)

AI_PRIORITIZATION_ENABLED = env_bool("AI_PRIORITIZATION_ENABLED", True)
AI_PRIORITIZATION_PROVIDER = os.getenv("AI_PRIORITIZATION_PROVIDER", "deterministic")
FATIGUE_DETECTION_ENABLED = env_bool("FATIGUE_DETECTION_ENABLED", True)
FATIGUE_AI_ENABLED = env_bool("FATIGUE_AI_ENABLED", False)
FATIGUE_HOURLY_THRESHOLD = env_int("FATIGUE_HOURLY_THRESHOLD", 20)
FATIGUE_DAILY_THRESHOLD = env_int("FATIGUE_DAILY_THRESHOLD", 100)
FATIGUE_UNREAD_THRESHOLD = env_int("FATIGUE_UNREAD_THRESHOLD", 50)
FATIGUE_DUPLICATE_THRESHOLD = env_int("FATIGUE_DUPLICATE_THRESHOLD", 1)
FATIGUE_DUPLICATE_WINDOW_HOURS = env_int("FATIGUE_DUPLICATE_WINDOW_HOURS", 24)

IMMUTABLE_AUDIT_LEDGER_ENABLED = env_bool("IMMUTABLE_AUDIT_LEDGER_ENABLED", True)
AUDIT_LEDGER_SIGNING_KEY = os.getenv("AUDIT_LEDGER_SIGNING_KEY", SECRET_KEY)
KUBERNETES_DEPLOYMENT_ENABLED = False  # ECS/Fargate is the deployment target.
CHAOS_ENGINEERING_ENABLED = env_bool("CHAOS_ENGINEERING_ENABLED", False)
CHAOS_ALLOWED_ENVIRONMENTS = os.getenv("CHAOS_ALLOWED_ENVIRONMENTS", "dev,qa")
CHAOS_ALLOW_PRODUCTION = env_bool("CHAOS_ALLOW_PRODUCTION", False)
CHAOS_MAX_DURATION_SECONDS = env_int("CHAOS_MAX_DURATION_SECONDS", 300)
CHAOS_MAX_AFFECTED_REPLICAS = env_int("CHAOS_MAX_AFFECTED_REPLICAS", 1)
LINEAGE_REQUIRE_AUTHORITATIVE_EDGES = True

# ---------------------------------------------------------------------------
# Entra API / external chat provider
# ---------------------------------------------------------------------------
CHAT_LLM_BASE_URL = os.getenv("CHAT_LLM_BASE_URL", "")
CHAT_LLM_API_KEY = os.getenv("CHAT_LLM_API_KEY", "")
CHAT_LLM_MODEL = os.getenv("CHAT_LLM_MODEL", "")
ENTRA_API_TENANT_ID = os.getenv("ENTRA_API_TENANT_ID", "")
ENTRA_API_CLIENT_ID = os.getenv("ENTRA_API_CLIENT_ID", "")
ENTRA_API_AUDIENCE = os.getenv("ENTRA_API_AUDIENCE", ENTRA_API_CLIENT_ID)
ENTRA_API_REQUIRED_SCOPE = os.getenv("ENTRA_API_REQUIRED_SCOPE", "access_as_user")
ENTRA_API_CLOCK_SKEW_SECONDS = env_int("ENTRA_API_CLOCK_SKEW_SECONDS", 60)

# ---------------------------------------------------------------------------
# Production hardening
# ---------------------------------------------------------------------------
if APP_ENV == "prod":
    from django.core.exceptions import ImproperlyConfigured

    if DEBUG:
        raise ImproperlyConfigured("DJANGO_DEBUG must be false in production")
    if not SECRET_KEY or SECRET_KEY == "dev-only-change-me":
        raise ImproperlyConfigured("GDX_SECRET_KEY must be configured in production")
    if not MONITORING_TOKEN:
        raise ImproperlyConfigured("MONITORING_TOKEN must be configured in production")
    if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
        raise ImproperlyConfigured("Explicit DJANGO_ALLOWED_HOSTS are required in production")
    if not AWS_STORAGE_BUCKET_NAME:
        raise ImproperlyConfigured("AWS_STORAGE_BUCKET_NAME is required in production")
    if not os.getenv("DB_PASSWORD"):
        raise ImproperlyConfigured("DB_PASSWORD is required in production")
    if not os.getenv("REDIS_URL"):
        raise ImproperlyConfigured("REDIS_URL is required in production")

    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = env_int("SECURE_HSTS_SECONDS", 31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
