import logging
import os

import requests
from django.core.cache import cache

logger = logging.getLogger(__name__)

TABLE_URL = "https://tmna.service-now.com/api/now/table/u_toyota_data_science_platform"
PARAMS = {
    "sysparm_query": "u_type=pod",
    "sysparm_fields": "u_primary",
    "sysparm_limit": "1000",
}
CACHE_KEY = "tdsp-pods-dropdown"


class PodsError(Exception):
    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def pod_options():
    cached = cache.get(CACHE_KEY)
    if cached is not None:
        return cached

    username = os.getenv("ONETS_USERNAME", "").strip()
    password = os.getenv("ONETS_PASSWORD", "").strip()
    if not username or not password:
        raise PodsError("TDSP pods are not configured.", 503)

    url = os.getenv("TDSP_PODS_URL", TABLE_URL).strip() or TABLE_URL
    try:
        response = requests.get(
            url,
            params=PARAMS,
            auth=(username, password),
            headers={"Accept": "application/json"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as error:
        logger.exception("TDSP pod lookup failed")
        raise PodsError("TDSP pods could not be loaded.", 502) from error

    rows = payload.get("result") if isinstance(payload, dict) else payload
    if not isinstance(rows, list):
        rows = []

    seen = set()
    options = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        value = str(row.get("u_primary") or row.get("value") or "").strip()
        if not value or value.casefold() in seen:
            continue
        seen.add(value.casefold())
        options.append({"u_primary": value, "label": value, "value": value})
    options.sort(key=lambda item: item["u_primary"].casefold())
    cache.set(CACHE_KEY, options, 300)
    return options
