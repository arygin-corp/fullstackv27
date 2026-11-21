import json
import os
import time
from pathlib import Path
from urllib.parse import urlencode, quote
import requests
from django.conf import settings
from django.core.cache import cache

TOKEN_CACHE_KEY = "denodo_metadata_views_token"
REQUEST_TIMEOUT_SECONDS = 30
TOKEN_REFRESH_SKEW_SECONDS = 60


class DenodoServiceError(Exception):
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload


def get_token_from_external_api():
    payload = {
        "client_id": os.getenv("DENODO_VIEWS_CLIENT_ID"),
        "client_secret": os.getenv("DENODO_VIEWS_CLIENT_SECRET"),
        "grant_type": os.getenv("DENODO_VIEWS_GRANT_TYPE"),
        "resource": os.getenv("DENODO_VIEWS_RESOURCE"),
    }
    response = requests.post(
        os.getenv("DENODO_VIEWS_AUTH_ENDPOINT"),
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def get_token():
    now = time.time()
    cached = cache.get(TOKEN_CACHE_KEY)
    expiry = int(cached.get("expiry", 0)) if cached else 0
    if cached and cached.get("accessToken") and expiry - TOKEN_REFRESH_SKEW_SECONDS > now:
        return cached["accessToken"]

    data = get_token_from_external_api()
    expiry = int(data["expires_on"])
    timeout = expiry - int(time.time()) - TOKEN_REFRESH_SKEW_SECONDS
    if timeout > 0:
        cache.set(
            TOKEN_CACHE_KEY,
            {"accessToken": data["access_token"], "expiry": expiry},
            timeout=timeout,
        )
    return data["access_token"]


def schema_role(user_role_name):
    """AD group slug used by the stored Denodo files. Accepts the slug or the display name."""
    role = (user_role_name or "").strip()
    if not role:
        return ""
    from apps.marketplace.models import ADGroup

    group = (
        ADGroup.objects.filter(value__iexact=role).only("value").first()
        or ADGroup.objects.filter(name__iexact=role).only("value").first()
    )
    if group and (group.value or "").strip():
        return group.value.strip()
    return role


def local_metadata_views(user_role_name):
    """Stored schema for one AD group: assets/json/marketplace/denodo/<role>.json."""
    role = schema_role(user_role_name)
    if not role:
        return None
    folder = Path(settings.MARKETPLACE_JSON_ROOT) / "denodo"
    stem = role.replace("-", "_").lower()
    path = next(
        (
            candidate
            for candidate in folder.glob("*.json")
            if "." not in candidate.stem and candidate.stem.lower() == stem
        ),
        None,
    )
    if path is None:
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def meta_data_views(user_role_name):
    role = (user_role_name or "").strip()
    if not role:
        raise DenodoServiceError(
            "Please provide user role name",
            status_code=400,
            payload={"errorCode": 400, "message": "Please provide user role name"},
        )

    escaped_role_name = role.replace("'", "''")
    params = urlencode(
        {
            "$select": "userrolename,dbname,elementname,column_name",
            "$filter": f"userrolename='{escaped_role_name}'",
        }
    )
    url = f"{os.getenv('DENODO_VIEWS_END_POINT')}?{params}"
    headers = {
        "content-type": "application/json",
        "Authorization": f"Bearer {get_token()}",
        "x-client-id": os.getenv("DENODO_VIEWS_X_CLIENT_ID"),
    }
    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = {"message": "Something went wrong! Please try later."}
        code = payload.get("code") or payload.get("errorCode") or response.status_code
        raise DenodoServiceError("Denodo request failed", status_code=int(code), payload=payload)
    return response.json()