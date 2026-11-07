import os

APP_ENV = os.getenv("APP_ENV", "local").lower()
ENVIRONMENT_DEFAULTS = {
    "demo":  {"fqdn": "admin.demo.data.toyota.com",  "region": "us-west-2"},
    "dev":   {"fqdn": "admin.dev.data.toyota.com",   "region": "us-west-2"},
    "qa":    {"fqdn": "admin.qa.data.toyota.com",    "region": "us-west-2"},
    "stage": {"fqdn": "admin.stage.data.toyota.com", "region": "us-west-2"},
    "prod":  {"fqdn": "admin.data.toyota.com",       "region": "us-east-1"},
}
_current = ENVIRONMENT_DEFAULTS.get(APP_ENV, {})
_fqdn = _current.get("fqdn", "localhost")
AWS_REGION = os.getenv("AWS_REGION", _current.get("region", "us-west-2"))
ALLOWED_HOSTS = [x.strip() for x in os.getenv("DJANGO_ALLOWED_HOSTS", _fqdn).split(",") if x.strip()]
CSRF_TRUSTED_ORIGINS = [x.strip() for x in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", f"https://{_fqdn}").split(",") if x.strip()]
