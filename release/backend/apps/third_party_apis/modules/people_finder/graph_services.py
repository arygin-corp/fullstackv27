import json
import os
import time
from urllib.parse import urlparse
import requests
from django.core.cache import cache
from .exceptions import PeopleDirectoryError
from apps.external_apis.audit import create_api_audit
from apps.external_apis.exceptions import (ExternalApiConfigurationError, ExternalApiRequestError,)
from apps.external_apis.models import APIRequestAudit

TOKEN_KEY = "people:graph:app-token"
TOKEN_LOCK_KEY = "people:graph:token-lock"

ALLOWED_FIELDS = {
    "id",
    "displayName",
    "givenName",
    "surname",
    "mail",
    "userPrincipalName",
    "jobTitle",
    "department",
    "officeLocation",
    "accountEnabled",
    "businessPhones",
    "mobilePhone",
    "companyName",
}


def required_env(name):
    value = os.getenv(name)
    if not value:
        raise ExternalApiConfigurationError(
            f"Environment variable {name!r} is not configured."
        )
    return value


def graph_base():
    endpoint = required_env("GRAPH_ENDPOINT").rstrip("/")
    version = required_env("GRAPH_VERSION").strip("/")
    return f"{endpoint}/{version}"


def graph_token(request=None, force_refresh=False):
    if not force_refresh:
        cached = cache.get(TOKEN_KEY)
        if cached:
            return cached

    locked = cache.add(TOKEN_LOCK_KEY, "1", timeout=30)
    if not locked:
        for _ in range(20):
            time.sleep(0.1)
            cached = cache.get(TOKEN_KEY)
            if cached:
                return cached

    try:
        response = requests.post(
            (
                f"{required_env('AAD_ENDPOINT').rstrip('/')}"
                f"/{required_env('PEOPLE_FINDER_TENANT_ID')}"
                "/oauth2/v2.0/token"
            ),
            data={
                "client_id": required_env("PEOPLE_FINDER_CLIENT_ID"),
                "client_secret": required_env("PEOPLE_FINDER_CLIENT_SECRET"),
                "grant_type": "client_credentials",
                "scope": f"{required_env('GRAPH_ENDPOINT').rstrip('/')}/.default",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        token = payload.get("access_token")
        if not token:
            raise ExternalApiRequestError(
                "Microsoft Graph token response did not contain access_token."
            )
        cache.set(
            TOKEN_KEY,
            token,
            timeout=max(1, int(payload.get("expires_in", 3600)) - 300),
        )
        return token
    except (requests.RequestException, ValueError) as exc:
        raise ExternalApiRequestError(
            "Unable to obtain a Microsoft Graph token."
        ) from exc
    finally:
        if locked:
            cache.delete(TOKEN_LOCK_KEY)


def _mapping(value):
    if not value:
        return {}
    if isinstance(value, dict):
        return value
    parsed = json.loads(value)
    if not isinstance(parsed, dict):
        raise ValueError("filter/search must be objects")
    return parsed


def _list(value):
    if not value:
        return []
    if isinstance(value, (list, tuple)):
        return list(value)
    return [item.strip() for item in str(value).split(",") if item.strip()]


def build_user_params(query):
    params = {"$count": "true"}
    filters = _mapping(query.get("filter"))
    search = _mapping(query.get("search"))

    for field in set(filters) | set(search):
        if field not in ALLOWED_FIELDS:
            raise ValueError(f"Unsupported Graph field: {field}")

    if filters:
        clauses = []
        for field, value in filters.items():
            if field == "accountEnabled":
                if not isinstance(value, bool):
                    raise ValueError("accountEnabled must be boolean")
                clauses.append(
                    f"accountEnabled eq {'true' if value else 'false'}"
                )
            else:
                escaped = str(value).replace("'", "''")
                clauses.append(f"startswith({field},'{escaped}')")
        params["$filter"] = " and ".join(clauses)

    if search:
        params["$search"] = " OR ".join(
            f'"{field}:{str(value).replace(chr(34), "")}"'
            for field, value in search.items()
        )

    select = _list(query.get("select"))
    sort = _list(query.get("sort"))

    if set(select) - ALLOWED_FIELDS:
        raise ValueError("Unsupported select field")
    if select:
        params["$select"] = ",".join(select)

    if sort:
        if any(item.split()[0] not in ALLOWED_FIELDS for item in sort):
            raise ValueError("Unsupported sort field")
        params["$orderby"] = ",".join(sort)

    if query.get("top") not in (None, ""):
        top = int(query["top"])
        if not 1 <= top <= 999:
            raise ValueError("top must be between 1 and 999")
        params["$top"] = str(top)

    return params


def _validate_users_url(url):
    parsed = urlparse(url)
    graph = urlparse(required_env("GRAPH_ENDPOINT"))
    expected_path = f"/{required_env('GRAPH_VERSION').strip('/')}/users"

    if (
        parsed.scheme != "https"
        or parsed.hostname != graph.hostname
        or parsed.port not in (None, 443)
        or parsed.path.rstrip("/") != expected_path
    ):
        raise ValueError(
            "The continuation link is not an approved Microsoft Graph users URL."
        )


def _get(url, request, params=None):
    _validate_users_url(url)
    started = time.monotonic()
    correlation_id = getattr(request, "correlation_id", None)

    try:
        response = requests.get(
            url,
            params=params,
            headers={
                "Authorization": f"Bearer {graph_token(request)}",
                "ConsistencyLevel": "eventual",
                "Accept": "application/json",
                "X-Correlation-ID": str(correlation_id or ""),
            },
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        create_api_audit(
            request=request,
            correlation_id=correlation_id,
            direction=APIRequestAudit.Direction.OUTBOUND,
            status=APIRequestAudit.Status.SUCCESS,
            method="GET",
            request_path=url,
            upstream_status_code=response.status_code,
            duration_ms=round((time.monotonic() - started) * 1000),
            request_parameters=params or {},
        )
        return payload
    except requests.Timeout as exc:
        create_api_audit(
            request=request,
            correlation_id=correlation_id,
            direction=APIRequestAudit.Direction.OUTBOUND,
            status=APIRequestAudit.Status.TIMEOUT,
            method="GET",
            request_path=url,
            duration_ms=round((time.monotonic() - started) * 1000),
            request_parameters=params or {},
            error_code="GRAPH_TIMEOUT",
            exception=exc,
        )
        raise ExternalApiRequestError(
            "Microsoft Graph request timed out."
        ) from exc
    except (requests.RequestException, ValueError) as exc:
        status_code = getattr(getattr(exc, "response", None), "status_code", None)
        create_api_audit(
            request=request,
            correlation_id=correlation_id,
            direction=APIRequestAudit.Direction.OUTBOUND,
            status=APIRequestAudit.Status.FAILED,
            method="GET",
            request_path=url,
            upstream_status_code=status_code,
            duration_ms=round((time.monotonic() - started) * 1000),
            request_parameters=params or {},
            error_code="GRAPH_REQUEST_FAILED",
            exception=exc,
        )
        raise ExternalApiRequestError(
            "Microsoft Graph request failed or returned invalid JSON."
        ) from exc


def search_users(request, query):
    return _get(
        f"{graph_base()}/users",
        request,
        build_user_params(query),
    )


def next_users(request, link):
    return _get(link, request)


def get_person_manager(request, user_id):
    try:
        return _get(
            f"{graph_base()}/users/{user_id}/manager",
            request,
            {
                "$select": ",".join(
                    [
                        "id",
                        "displayName",
                        "mail",
                        "jobTitle",
                        "department",
                    ]
                )
            },
        )
    except (
        ExternalApiConfigurationError,
        ExternalApiRequestError,
        ValueError,
    ) as exc:
        raise PeopleDirectoryError(str(exc)) from exc

def get_user_photo(request, user_id):
    response = requests.get(
        f"{graph_base()}/users/{user_id}/photo/$value",
        headers={
            "Authorization": f"Bearer {graph_token(request)}"
        },
        timeout=15,
    )

    response.raise_for_status()

    return {
        "content": response.content,
        "content_type": response.headers.get(
            "Content-Type",
            "image/jpeg",
        ),
    }