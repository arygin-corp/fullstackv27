import hashlib
import json
import os
import time
import uuid
import requests
from django.core.cache import cache
from requests.auth import HTTPBasicAuth
from .audit import create_api_audit
from .exceptions import ExternalApiConfigurationError, ExternalApiRequestError
from .models import APIConfiguration, APIRequestAudit
from .security import validate_destination

TRANSIENT_STATUS_CODES = {408, 429, 500, 502, 503, 504}

def required_env(name):
    value = os.getenv(name) if name else None
    if not value: raise ExternalApiConfigurationError(f"Environment variable {name!r} is not configured.")
    return value

def get_config(slug, version=None):
    qs = APIConfiguration.objects.prefetch_related("parameters").filter(slug=slug, active=True, lifecycle=APIConfiguration.Lifecycle.ACTIVE)
    if version is not None: qs = qs.filter(version=version)
    config = qs.order_by("-version").first()
    if config is None: raise ExternalApiConfigurationError(f"Active API configuration {slug!r} was not found.")
    config.full_clean(); return config

def extract_path(payload, path):
    current = payload
    for segment in path.split(".") if path else []:
        if not isinstance(current, dict) or segment not in current: raise ExternalApiRequestError(f"Response did not contain {path!r}.")
        current = current[segment]
    return current

def render_template(value, replacements):
    if isinstance(value, dict): return {k: render_template(v, replacements) for k, v in value.items()}
    if isinstance(value, list): return [render_template(v, replacements) for v in value]
    if isinstance(value, str):
        for key, replacement in replacements.items(): value = value.replace("{{" + key + "}}", str(replacement))
    return value

def _cache_key(config, params):
    digest = hashlib.sha256(json.dumps(params, sort_keys=True, default=str).encode()).hexdigest()
    return f"external_api:{config.slug}:{config.version}:{digest}"

def _auth(config, headers, query):
    if config.auth_type == APIConfiguration.AuthenticationType.BASIC:
        return HTTPBasicAuth(
            required_env(config.username_env_var),
            required_env(config.password_env_var),
        )
    if config.auth_type in (
        APIConfiguration.AuthenticationType.BEARER,
        APIConfiguration.AuthenticationType.BEARER_ENV,
    ):
        token = required_env(config.bearer_token_env_var)
        headers["Authorization"] = f"Bearer {token}"
    if config.api_key_enabled:
        key = required_env(config.api_key_env_var)
        if config.api_key_location == APIConfiguration.APIKeyLocation.QUERY:
            query[config.api_key_name] = key
        else:
            headers[config.api_key_name] = key
    return None

def execute_api(slug, *, version=None, request=None, params=None, json_body=None, form_body=None, files=None, headers=None, force_refresh=False, enforce_declared_parameters=False):
    correlation_id = getattr(request, "correlation_id", uuid.uuid4()); config = get_config(slug, version); started = time.monotonic(); host = validate_destination(config.full_url, config.approved_hosts)
    query = {p.upstream_name or p.key: p.value for p in config.parameters.all() if p.active and not p.client_supplied and p.location == p.Location.QUERY}
    supplied_params = {k: v for k, v in (params or {}).items() if v is not None}  
    if enforce_declared_parameters: supplied_params = validate_and_map_parameters(config, supplied_params, "query")  
    query.update(supplied_params); validate_json_schema(json_body, config.request_schema, "request") if json_body is not None else None; request_headers = dict(config.default_headers or {}); request_headers.update(headers or {}); auth = _auth(config, request_headers, query)
    cache_key = _cache_key(config, query)
    if config.http_method == "GET" and config.cache_seconds and not force_refresh:
        cached = cache.get(cache_key)
        if cached is not None:
            create_api_audit(request=request, correlation_id=correlation_id, direction=APIRequestAudit.Direction.OUTBOUND, api_configuration=config, configuration_version=config.version, status=APIRequestAudit.Status.CACHE_HIT, upstream_host=host, duration_ms=round((time.monotonic()-started)*1000), request_parameters=query)
            return cached
    last_error = None
    for attempt in range(1, config.retry_attempts + 1):
        try:
            response = requests.request(config.http_method, config.full_url, params=query, json=json_body, data=form_body, files=files, headers=request_headers, auth=auth, timeout=(config.connection_timeout_seconds, config.timeout_seconds), verify=config.verify_ssl, allow_redirects=config.allow_redirects, stream=True)
            if response.status_code in set(config.retry_status_codes or TRANSIENT_STATUS_CODES) and attempt < config.retry_attempts:
                time.sleep(min(0.5 * 2 ** (attempt - 1), 4)); continue
            response.raise_for_status(); content_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
            if config.allowed_content_types and content_type not in {str(v).lower() for v in config.allowed_content_types}: raise ExternalApiRequestError("External API returned an unsupported content type.")
            raw = response.raw.read(config.maximum_response_bytes + 1, decode_content=True)
            if len(raw) > config.maximum_response_bytes: raise ExternalApiRequestError("External API response exceeded the configured size limit.")
            try: payload = json.loads(raw.decode(response.encoding or "utf-8"))
            except (ValueError, UnicodeDecodeError) as exc: raise ExternalApiRequestError("External API returned invalid JSON.") from exc
            result = extract_path(payload, config.response_path)
            if config.http_method == "GET" and config.cache_seconds: cache.set(cache_key, result, config.cache_seconds)
            create_api_audit(request=request, correlation_id=correlation_id, direction=APIRequestAudit.Direction.OUTBOUND, api_configuration=config, configuration_version=config.version, status=APIRequestAudit.Status.SUCCESS, upstream_host=host, upstream_status_code=response.status_code, duration_ms=round((time.monotonic()-started)*1000), attempt_number=attempt, retry_count=attempt-1, response_bytes=len(raw), request_parameters=query, sensitive_keys=[p.key for p in config.parameters.all() if p.sensitive])
            return result
        except requests.Timeout as exc: last_error = exc
        except (requests.RequestException, ExternalApiRequestError) as exc:
            last_error = exc
            if isinstance(exc, requests.RequestException) and getattr(exc.response, "status_code", None) not in set(config.retry_status_codes or TRANSIENT_STATUS_CODES): break
    status = APIRequestAudit.Status.TIMEOUT if isinstance(last_error, requests.Timeout) else APIRequestAudit.Status.FAILED
    create_api_audit(request=request, correlation_id=correlation_id, direction=APIRequestAudit.Direction.OUTBOUND, api_configuration=config, configuration_version=config.version, status=status, upstream_host=host, duration_ms=round((time.monotonic()-started)*1000), request_parameters=query, exception=last_error)
    raise ExternalApiRequestError("External API request failed.") from last_error

def oauth_client_credentials(token_slug, *, request, client_id_env, client_secret_env, grant_type_env, resource_env):
    return execute_api(token_slug, request=request, form_body={"client_id": required_env(client_id_env), "client_secret": required_env(client_secret_env), "grant_type": required_env(grant_type_env), "resource": required_env(resource_env)}, headers={"Content-Type": "application/x-www-form-urlencoded"})
