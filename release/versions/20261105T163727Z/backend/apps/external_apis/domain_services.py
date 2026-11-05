import os


from .exceptions import ExternalApiConfigurationError, ExternalApiRequestError
from .services import execute_api, get_config, oauth_client_credentials, render_template


def tdsp_pods(request):
    rows = execute_api("tdsp-pods", request=request)
    values = sorted(
        {str(row.get("u_primary") or "").strip() for row in rows if row.get("u_primary")},
        key=str.casefold,
    )
    return [{"label": value, "value": value} for value in values]


def add_to_cart(request, payload):
    source = payload.get("cartData") if isinstance(payload.get("cartData"), dict) else payload
    quantity = source.get("sysparm_quantity", "1")
    if isinstance(quantity, list):
        quantity = quantity[0] if quantity else "1"
    body = {"variables": source.get("variables"), "sysparm_quantity": str(quantity).strip()}
    errors = []
    if not isinstance(body["variables"], dict):
        errors.append("variables must be an object")
    if not body["sysparm_quantity"].isdigit():
        errors.append("sysparm_quantity must be an integer")
    if errors:
        raise ValueError(errors)
    return execute_api("servicenow-add-to-cart", request=request, json_body=body, headers={"X-Correlation-ID": str(request.correlation_id)})


def submit_cart(request, payload):
    body = payload.get("submitCartData") if isinstance(payload.get("submitCartData"), dict) else payload
    if not isinstance(body, dict):
        raise ValueError("submitCartData must be an object")
    return execute_api("servicenow-submit-cart", request=request, json_body=body, headers={"X-Correlation-ID": str(request.correlation_id)})


def upload_attachment(request, table_name, table_sys_id, uploaded_file):
    if not table_name or not table_sys_id or not uploaded_file:
        raise ValueError("table_name, table_sys_id, and file are required")
    return execute_api(
        "servicenow-attachment-upload",
        request=request,
        form_body={"table_name": table_name, "table_sys_id": table_sys_id, "file_name": uploaded_file.name},
        files={"file": (uploaded_file.name, uploaded_file.file, getattr(uploaded_file, "content_type", "application/octet-stream"))},
    )


def metadata_views(request, role):
    if not role:
        raise ValueError("userrolename is required")
    token_data = oauth_client_credentials("metadata-views-token", request=request, client_id_env="METADATA_VIEWS_CLIENT_ID", client_secret_env="METADATA_VIEWS_CLIENT_SECRET", grant_type_env="METADATA_VIEWS_GRANT_TYPE", resource_env="METADATA_VIEWS_RESOURCE")
    token = token_data.get("access_token")
    if not token:
        raise ExternalApiRequestError("Metadata token response did not contain access_token")
    return execute_api("metadata-views", request=request, params={"$select": "userrolename,dbname,elementname,column_name", "$filter": f"userrolename='{role}'"}, headers={"Authorization": f"Bearer {token}", "x-client-id": os.getenv("METADATA_VIEWS_X_CLIENT_ID", "")})


def axon_search(request, identifier):
    if not identifier:
        raise ValueError("id is required")
    token_data = oauth_client_credentials("axon-token", request=request, client_id_env="AXON_CLIENT_ID", client_secret_env="AXON_CLIENT_SECRET", grant_type_env="AXON_GRANT_TYPE", resource_env="AXON_RESOURCE")
    token = token_data.get("access_token")
    if not token:
        raise ExternalApiRequestError("Axon token response did not contain access_token")
    config = get_config("axon-facet-search")
    if not config.request_template:
        raise ExternalApiConfigurationError("Axon request_template is not configured")
    body = render_template(config.request_template, {"value": identifier, "id": identifier})
    return execute_api("axon-facet-search", request=request, json_body=body, headers={"Authorization": f"Bearer {token}", "x-client-id": os.getenv("FACETSEARCH_X_CLIENT_ID", "")})


def extract_axon(data, index):
    try:
        return data["mainObject"]["items"][0]["values"][index]
    except (KeyError, IndexError, TypeError) as exc:
        raise ExternalApiRequestError("Axon response did not contain the expected value") from exc


def request_ids(request, query):
    filters = []
    if query.get("requestedFor"):
        filters.append(f"request.requested_for.u_ad_object_id={query['requestedFor']}")
    if query.get("catalogItem"):
        filters.append(f"cat_item={query['catalogItem']}")
    rows = execute_api("servicenow-request-search", request=request, params={"sysparm_fields": "request", "sysparm_limit": query.get("limit", "5"), "sysparm_display_value": "true", "sysparm_exclude_reference_link": "true", "sysparm_query": "^".join(filters) or None})
    return [str(row["request"]) for row in rows if row.get("request")]


def request_details(request, ids):
    clean_ids = [str(value) for value in ids if value]
    if not clean_ids:
        return {}
    return execute_api("servicenow-request-details", request=request, headers={"Request": ",".join(clean_ids)})
