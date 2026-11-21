"""GA4 connection stored locally. The service-account key never goes back to the page."""

import json
from pathlib import Path

import jwt
import requests
from django.conf import settings
from django.utils import timezone

STORE_NAME = "google_analytics.json"
READONLY_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
TOKEN_URL = "https://oauth2.googleapis.com/token"
DATA_API = "https://analyticsdata.googleapis.com/v1beta/properties"


def store_path():
    return Path(settings.BASE_DIR) / "data" / STORE_NAME


def clean_property_id(value):
    text = str(value or "").strip()
    if text.lower().startswith("properties/"):
        text = text.split("/", 1)[1]
    if not text.isdigit():
        return ""
    return text


def parse_service_account(raw):
    try:
        payload = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return None, "Upload the service account JSON file from Google Cloud."
    if not isinstance(payload, dict) or payload.get("type") != "service_account":
        return None, "That file is not a Google service account key."
    email = str(payload.get("client_email") or "").strip()
    key = payload.get("private_key") or ""
    if "@" not in email or "BEGIN PRIVATE KEY" not in key:
        return None, "The service account file is missing its email or private key."
    kept = {
        "type": "service_account",
        "client_email": email,
        "private_key": key,
        "token_uri": payload.get("token_uri") or TOKEN_URL,
    }
    return kept, ""


def _read():
    path = store_path()
    if not path.is_file():
        return {}
    try:
        payload = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def public_connection():
    stored = _read()
    credentials = stored.get("credentials") if isinstance(stored.get("credentials"), dict) else {}
    return {
        "property_id": clean_property_id(stored.get("property_id")),
        "client_email": str(credentials.get("client_email") or ""),
        "connected": bool(credentials.get("private_key")),
        "summary": stored.get("summary") if isinstance(stored.get("summary"), dict) else {},
    }


def save_connection(property_id, raw_json=""):
    property_id = clean_property_id(property_id)
    if not property_id:
        return False, "Enter the GA4 property ID. It is the number in the property settings."
    stored = _read()
    credentials = stored.get("credentials") if isinstance(stored.get("credentials"), dict) else None
    if raw_json:
        credentials, message = parse_service_account(raw_json)
        if message:
            return False, message
    if not credentials or not credentials.get("private_key"):
        return False, "Upload the service account JSON file from Google Cloud."
    path = store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "property_id": property_id,
        "credentials": credentials,
        "summary": stored.get("summary") if isinstance(stored.get("summary"), dict) else {},
    }
    path.write_text(json.dumps(payload))
    path.chmod(0o600)
    return True, "Google Analytics connection saved."


def disconnect():
    path = store_path()
    if path.is_file():
        path.unlink()
    return True, "Google Analytics is disconnected."


def _token(credentials):
    now = int(timezone.now().timestamp())
    assertion = jwt.encode(
        {
            "iss": credentials["client_email"],
            "scope": READONLY_SCOPE,
            "aud": credentials.get("token_uri") or TOKEN_URL,
            "iat": now,
            "exp": now + 3600,
        },
        credentials["private_key"],
        algorithm="RS256",
    )
    response = requests.post(
        credentials.get("token_uri") or TOKEN_URL,
        data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": assertion},
        timeout=20,
    )
    body = response.json() if response.content else {}
    if response.status_code != 200 or not body.get("access_token"):
        detail = body.get("error_description") or body.get("error") or "Google rejected the service account."
        raise RuntimeError(str(detail))
    return body["access_token"]


def test_connection():
    stored = _read()
    credentials = stored.get("credentials") if isinstance(stored.get("credentials"), dict) else {}
    property_id = clean_property_id(stored.get("property_id"))
    if not property_id or not credentials.get("private_key"):
        return False, "Save a property ID and service account before testing the connection."
    try:
        token = _token(credentials)
        response = requests.post(
            f"{DATA_API}/{property_id}:runReport",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "dateRanges": [{"startDate": "7daysAgo", "endDate": "yesterday"}],
                "metrics": [{"name": "activeUsers"}, {"name": "sessions"}, {"name": "screenPageViews"}],
            },
            timeout=20,
        )
        body = response.json() if response.content else {}
        if response.status_code != 200:
            detail = (body.get("error") or {}).get("message") or "Google Analytics refused this property."
            raise RuntimeError(str(detail))
        values = (body.get("rows") or [{}])[0].get("metricValues") or []
        numbers = [item.get("value") or "0" for item in values]
        while len(numbers) < 3:
            numbers.append("0")
        summary = {
            "active_users": numbers[0],
            "sessions": numbers[1],
            "page_views": numbers[2],
            "checked_at": timezone.now().isoformat(),
        }
    except requests.RequestException:
        return False, "Google Analytics could not be reached."
    except Exception as exc:
        message = str(exc)
        if "PRIVATE KEY" in message or "BEGIN" in message:
            message = "The service account key could not be used."
        return False, message
    stored["summary"] = summary
    path = store_path()
    path.write_text(json.dumps(stored))
    path.chmod(0o600)
    return True, "Connected. Totals below are the last 7 days."
