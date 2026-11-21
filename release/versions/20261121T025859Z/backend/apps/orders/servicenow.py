import requests
from django.conf import settings


class ServiceNowError(RuntimeError):
    pass


class ServiceNowClient:
    def __init__(self):
        config = getattr(settings, "SERVICENOW", {})
        self.base_url = config.get("BASE_URL", "").rstrip("/")
        self.submit_path = config.get("SUBMIT_PATH", "/api/orders")
        self.updates_path = config.get("UPDATES_PATH", "/api/orders/updates")
        self.timeout = tuple(config.get("TIMEOUT", (3.05, 20)))
        self.verify_ssl = config.get("VERIFY_SSL", True)
        self.session = requests.Session()
        if config.get("TOKEN"):
            self.session.headers["Authorization"] = f"Bearer {config['TOKEN']}"
        elif config.get("USERNAME"):
            self.session.auth = (config["USERNAME"], config.get("PASSWORD", ""))
        self.session.headers.update({"Accept": "application/json", "Content-Type": "application/json"})

    def _request(self, method, path, **kwargs):
        if not self.base_url:
            raise ServiceNowError("SERVICENOW.BASE_URL is not configured")
        response = self.session.request(method, f"{self.base_url}/{path.lstrip('/')}", timeout=self.timeout, verify=self.verify_ssl, **kwargs)
        if not 200 <= response.status_code < 300:
            raise ServiceNowError(f"ServiceNow returned HTTP {response.status_code}")
        try:
            return response.json(), response.status_code
        except ValueError as exc:
            raise ServiceNowError("ServiceNow returned invalid JSON") from exc

    def submit_order(self, payload):
        return self._request("POST", self.submit_path, json=payload)

    def fetch_updates(self, watermark=None, cursor=""):
        params = {}
        if watermark:
            params["updated_since"] = watermark.isoformat()
        if cursor:
            params["cursor"] = cursor
        return self._request("GET", self.updates_path, params=params)
