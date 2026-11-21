import os
import time

import requests
from django.core.cache import cache

TOKEN_CACHE_KEY = "axon_facet_search_token"
REQUEST_TIMEOUT_SECONDS = 30
TOKEN_REFRESH_SKEW_SECONDS = 60


class AxonServiceError(Exception):
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload if payload is not None else {"message": message}


def facet_search_payload(value):
    return {
        "mainFacet": "Glossary",
        "searchGroups": [
            {
                "operator": "START",
                "active": True,
                "searches": [
                    {
                        "operator": "START",
                        "active": True,
                        "facetId": "Glossary",
                        "filterGroups": [
                            {
                                "operator": "START",
                                "filters": [
                                    {
                                        "operator": "START",
                                        "type": "ID",
                                        "properties": {"field": "ID", "value": value},
                                    }
                                ],
                            }
                        ],
                    }
                ],
            }
        ],
        "searchScopes": {
            "mainFacet": {
                "facetId": "Glossary",
                "orderList": [{"field": "name", "type": "ASC"}],
                "properties": {"offset": "0", "limit": "1000"},
                "filters": [],
            },
            "relationships": [
                {
                    "facetId": "Glossary",
                    "fields": [],
                    "orderList": [{"field": "name", "type": "ASC"}],
                    "properties": {"offset": "0", "limit": "10"},
                    "filters": [],
                }
            ],
        },
    }


def get_token_from_external_api():
    response = requests.post(
        os.getenv("AXON_END_POINT"),
        data={
            "client_id": os.getenv("AXON_CLIENT_ID"),
            "client_secret": os.getenv("AXON_CLIENT_SECRET"),
            "grant_type": os.getenv("AXON_GRANT_TYPE"),
            "resource": os.getenv("AXON_RESOURCE"),
        },
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


def _search(value):
    if not value:
        raise AxonServiceError("Please provide id", status_code=400, payload={"errorCode": 400, "message": "Please provide id"})
    token = get_token()
    response = requests.post(
        os.getenv("AXON_FACETSEARCH_END_POINT"),
        json=facet_search_payload(value),
        headers={
            "Authorization": f"Bearer {token}",
            "x-client-id": os.getenv("AXON_FACETSEARCH_X_CLIENT_ID"),
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = {"message": "Something went wrong! Please try later."}
        code = payload.get("code") or payload.get("errorCode") or response.status_code
        raise AxonServiceError("Axon request failed", status_code=int(code), payload=payload)
    return response.json()


def _value_at(data, index):
    try:
        return data["mainObject"]["items"][0]["values"][index]
    except (KeyError, IndexError, TypeError) as error:
        raise AxonServiceError("Something went wrong! Please try later.") from error


def axon_facet_search(value):
    return _value_at(_search(value), 8)


def axon_glossary_search(value):
    return _value_at(_search(value), 2)
