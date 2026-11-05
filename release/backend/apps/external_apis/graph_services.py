import json, os, time
from urllib.parse import urlparse
import requests
from django.core.cache import cache
from .audit import create_api_audit
from .exceptions import ExternalApiConfigurationError, ExternalApiRequestError
from .models import APIRequestAudit

TOKEN_KEY = "external_apis:graph:app-token"
TOKEN_LOCK_KEY = "external_apis:graph:token-lock"
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


def env(name):
    value = os.getenv(name)
    if not value:
        raise ExternalApiConfigurationError(
            f"Environment variable '{name}' is not configured."
        )
    return value


def graph_base():
    return f"{env('GRAPH_ENDPOINT').rstrip('/')}/{env('GRAPH_VERSION').strip('/')}"


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
        r = requests.post(
            f"{env('AAD_ENDPOINT').rstrip('/')}/{env('PEOPLE_FINDER_TENANT_ID')}/oauth2/v2.0/token",
            data={
                "client_id": env("PEOPLE_FINDER_CLIENT_ID"),
                "client_secret": env("PEOPLE_FINDER_CLIENT_SECRET"),
                "grant_type": "client_credentials",
                "scope": f"{env('GRAPH_ENDPOINT').rstrip('/')}/.default",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        token = data.get("access_token")
        if not token:
            raise ExternalApiRequestError(
                "Graph token response did not contain access_token."
            )
        cache.set(
            TOKEN_KEY,
            token,
            timeout=max(1, int(data.get("expires_in", 3600)) - 300),
        )
        return token
    except requests.RequestException as exc:
        raise ExternalApiRequestError(
            "Unable to obtain Microsoft Graph token."
        ) from exc
    finally:
        if locked:
            cache.delete(TOKEN_LOCK_KEY)


def _mapping(v):
    if not v:
        return {}
    if isinstance(v, dict):
        return v
    p = json.loads(v)
    if not isinstance(p, dict):
        raise ValueError("filter/search must be objects")
    return p


def _list(v):
    if not v:
        return []
    if isinstance(v, (list, tuple)):
        return list(v)
    return [x.strip() for x in str(v).split(",") if x.strip()]


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
                clauses.append(
                    f"startswith({field},'{str(value).replace(chr(39),chr(39)*2)}')"
                )
        params["$filter"] = " and ".join(clauses)
    if search:
        params["$search"] = " OR ".join(
            f'"{f}:{str(v).replace(chr(34), "")}"' for f, v in search.items()
        )
    select = _list(query.get("select"))
    sort = _list(query.get("sort"))
    if set(select) - ALLOWED_FIELDS:
        raise ValueError("Unsupported select field")
    if select:
        params["$select"] = ",".join(select)
    if sort:
        if any(x.split()[0] not in ALLOWED_FIELDS for x in sort):
            raise ValueError("Unsupported sort field")
        params["$orderby"] = ",".join(sort)
    if query.get("top") not in (None, ""):
        top = int(query["top"])
        if not 1 <= top <= 999:
            raise ValueError("top must be between 1 and 999")
        params["$top"] = str(top)
    return params


def _get(url, request, params=None):
    started = time.monotonic()
    cid = getattr(request, "correlation_id", None)
    try:
        r = requests.get(
            url,
            params=params,
            headers={
                "Authorization": f"Bearer {graph_token(request)}",
                "ConsistencyLevel": "eventual",
                "Accept": "application/json",
                "X-Correlation-ID": str(cid or ""),
            },
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        create_api_audit(
            request=request,
            correlation_id=cid,
            direction=APIRequestAudit.Direction.OUTBOUND,
            status=APIRequestAudit.Status.SUCCESS,
            method="GET",
            request_path=url,
            upstream_status_code=r.status_code,
            duration_ms=round((time.monotonic() - started) * 1000),
            request_parameters=params or {},
        )
        return data
    except requests.Timeout as exc:
        raise ExternalApiRequestError(
            "Microsoft Graph request timed out."
        ) from exc
    except (requests.RequestException, ValueError) as exc:
        raise ExternalApiRequestError(
            "Microsoft Graph request failed or returned invalid JSON."
        ) from exc


def search_users(request, query):
    return _get(f"{graph_base()}/users", request, build_user_params(query))


def next_users(request, link):
    parsed = urlparse(link)
    graph = urlparse(env("GRAPH_ENDPOINT"))
    expected = f"/{env('GRAPH_VERSION').strip('/')}/users"
    if (
        parsed.scheme != "https"
        or parsed.hostname != graph.hostname
        or parsed.port not in (None, 443)
        or parsed.path.rstrip("/") != expected
    ):
        raise ValueError(
            "nextLink is not an approved Microsoft Graph users URL."
        )
    return _get(link, request)

def _rank(user, field, target):
    value = str(user.get(field) or "").strip().casefold(); target = str(target or "").strip().casefold()
    if value == target: return (0, value)
    pos = value.find(target)
    return (1, pos, value) if pos >= 0 else (2, value)
def sort_by_name_relevance(data, query):
    values = data.get("value") if isinstance(data, dict) else None
    criteria = _mapping(query.get("search")) or _mapping(query.get("filter"))
    fields = [f for f in ("givenName", "surname", "displayName") if criteria.get(f)]
    if isinstance(values, list) and fields and not query.get("sort"):
        values.sort(key=lambda user: tuple(_rank(user, f, criteria[f]) for f in fields))
    return data
