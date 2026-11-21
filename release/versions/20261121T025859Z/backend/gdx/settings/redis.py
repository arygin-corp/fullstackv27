import os

from django.core.exceptions import ImproperlyConfigured

# Nonprod ElastiCache is edmp-gdxp-admin-nonprod-redis in us-west-2.
# Demo, dev, QA, and stage share this host and use separate databases.
NONPROD_REDIS_HOST = (
    "master.edmp-gdxp-admin-nonprod-redis.ukx1ws.usw2.cache.amazonaws.com"
)
NONPROD_REDIS_DB = {
    "demo": 0,
    "dev": 1,
    "qa": 2,
    "stage": 3,
}

# Prod ElastiCache is a different cluster in us-east-1.
# Its primary endpoint is assigned when edmp-gdxp-admin-prod-redis is created.
PROD_REDIS_CLUSTER = "edmp-gdxp-admin-prod-redis"
PROD_REDIS_REGION = "us-east-1"
PROD_REDIS_DB = 0


def configure_nonprod_redis(environment: str) -> None:
    url = f"rediss://{NONPROD_REDIS_HOST}:6379/{NONPROD_REDIS_DB[environment]}"
    os.environ.setdefault("REDIS_URL", url)
    os.environ.setdefault("CELERY_BROKER_URL", os.environ["REDIS_URL"])


def configure_prod_redis() -> None:
    url = os.getenv("REDIS_URL", "")
    if not url:
        raise ImproperlyConfigured(
            "REDIS_URL is required for prod. Use the primary endpoint of "
            f"{PROD_REDIS_CLUSTER} in {PROD_REDIS_REGION} on database {PROD_REDIS_DB}."
        )
    if NONPROD_REDIS_HOST in url or ".usw2.cache.amazonaws.com" in url:
        raise ImproperlyConfigured(
            "Prod cannot use the us-west-2 nonprod Redis cluster. "
            f"Set REDIS_URL to {PROD_REDIS_CLUSTER} in {PROD_REDIS_REGION}."
        )
    os.environ["REDIS_URL"] = url
    os.environ.setdefault("CELERY_BROKER_URL", url)
