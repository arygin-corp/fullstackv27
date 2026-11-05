import os
import time
from urllib.parse import urlencode, quote
import requests
from django.core.cache import cache

TOKEN_CACHE_KEY = "denodo_metadata_views_token"
REQUEST_TIMEOUT_SECONDS = 30


class DenodoServiceError(Exception):
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload


def get_token_from_external_api():
    payload = {
        "client_id": os.getenv("METADATA_VIEWS_CLIENT_ID"),
        "client_secret": os.getenv("METADATA_VIEWS_CLIENT_SECRET"),
        "grant_type": os.getenv("METADATA_VIEWS_GRANT_TYPE"),
        "resource": os.getenv("METADATA_VIEWS_RESOURCE"),
    }
    response = requests.post(
        os.getenv("METADATA_VIEW_AUTH_ENDPOINT"),
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def get_token():
    cached = cache.get(TOKEN_CACHE_KEY)
    if cached and cached.get("accessToken") and int(cached.get("expiry", 0)) > time.time():
        return cached["accessToken"]

    data = get_token_from_external_api()
    expiry = int(data["expires_on"])
    timeout = expiry - int(time.time()) - 60
    if timeout > 0:
        cache.set(
            TOKEN_CACHE_KEY,
            {"accessToken": data["access_token"], "expiry": expiry},
            timeout=timeout,
        )
    return data["access_token"]


def meta_data_views(user_role_name):
    if not user_role_name:
        raise DenodoServiceError(
            "Please provide user role name",
            status_code=400,
            payload={"errorCode": 400, "message": "Please provide user role name"},
        )

    escaped_role_name = user_role_name.replace("'", "''")
    params = urlencode(
        {
            "$select": "userrolename,dbname,elementname,column_name",
            "$filter": f"userrolename='{escaped_role_name}'",
        }
    )
    url = f"{os.getenv('VIEWS_END_POINT')}?{params}"
    headers = {
        "content-type": "application/json",
        "Authorization": f"Bearer {get_token()}",
        "x-client-id": os.getenv("METADATA_VIEWS_X_CLIENT_ID"),
    }
    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()