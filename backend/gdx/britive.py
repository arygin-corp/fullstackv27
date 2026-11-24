"""Share one Britive AWS checkout with the whole app for eight hours."""

import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from contextvars import ContextVar
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

_current_user = ContextVar("britive_user", default=None)


class BritiveError(RuntimeError):
    pass


class BritiveUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = _current_user.set(getattr(request, "user", None))
        try:
            return self.get_response(request)
        finally:
            _current_user.reset(token)


def configured():
    return bool(_token() and _base_url())


def user_is_designated(user):
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    allowed = {
        item.strip().lower()
        for item in os.getenv("BRITIVE_ALLOWED_USERS", "").split(",")
        if item.strip()
    }
    email = (getattr(user, "email", "") or "").strip().lower()
    username = (getattr(user, "get_username", lambda: "")() or "").strip().lower()
    return bool(allowed) and (email in allowed or username in allowed)


def aws_client_kwargs():
    """Shared checkout credentials, used by every AWS call until they expire."""
    shared = shared_credentials()
    if shared:
        return shared
    return {}


def shared_credentials():
    stored = _read_shared()
    if not stored:
        return None
    try:
        expires = datetime.fromisoformat(stored.get("expires_at") or "")
    except ValueError:
        return None
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= datetime.now(timezone.utc):
        return None
    credentials = {
        "aws_access_key_id": stored.get("aws_access_key_id") or "",
        "aws_secret_access_key": stored.get("aws_secret_access_key") or "",
    }
    if stored.get("aws_session_token"):
        credentials["aws_session_token"] = stored["aws_session_token"]
    if not credentials["aws_access_key_id"] or not credentials["aws_secret_access_key"]:
        return None
    return credentials


def ensure_shared_checkout(user):
    """After a successful sign-in, keep the current checkout or replace an expired one."""
    if shared_credentials():
        return
    if not configured():
        return
    try:
        profile = _find_profile(_profile_name())
        status = _checkout(profile["profile_id"], profile["environment_id"])
        remember_checkout(_credentials(_tokens(status["transactionId"])), user)
    except BritiveError:
        return


_PASTE_KEYS = {
    "AWS_ACCESS_KEY_ID": "aws_access_key_id",
    "AWS_SECRET_ACCESS_KEY": "aws_secret_access_key",
    "AWS_SESSION_TOKEN": "aws_session_token",
    "ACCESSKEYID": "aws_access_key_id",
    "SECRETACCESSKEY": "aws_secret_access_key",
    "SESSIONTOKEN": "aws_session_token",
    "AWSACCESSKEYID": "aws_access_key_id",
    "AWSSECRETACCESSKEY": "aws_secret_access_key",
    "AWSSESSIONTOKEN": "aws_session_token",
}
_PASTE_LINE = re.compile(
    r"(?:export\s+)?([A-Za-z0-9_]+)\s*[=:]\s*[\"']?([^\"'\n]+)",
)


def credentials_from_paste(text):
    found = {}
    raw = (text or "").strip()
    if raw.startswith("{") or raw.startswith("["):
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = None
        if isinstance(payload, dict):
            for key, value in payload.items():
                mapped = _PASTE_KEYS.get(re.sub(r"[^A-Za-z0-9]", "", str(key)).upper())
                if mapped and value:
                    found[mapped] = str(value).strip()
    for key, value in _PASTE_LINE.findall(raw):
        mapped = _PASTE_KEYS.get(key.upper()) or _PASTE_KEYS.get(re.sub(r"[^A-Za-z0-9]", "", key).upper())
        if mapped and value.strip():
            found[mapped] = value.strip()
    return found


def save_pasted_checkout(text, user):
    credentials = credentials_from_paste(text)
    missing = [
        label
        for label, key in (
            ("access key", "aws_access_key_id"),
            ("secret key", "aws_secret_access_key"),
            ("session token", "aws_session_token"),
        )
        if not credentials.get(key)
    ]
    if missing:
        return False, "Paste the access key, secret key, and session token from the Britive checkout."
    try:
        identity = _caller_identity(credentials)
    except Exception:
        return False, "AWS rejected these credentials. Copy a fresh checkout and try again."
    account = identity.get("Account") or ""
    role = _role_name(identity.get("Arn") or "")
    if role == "radar-dev-role":
        return False, "This checkout is radar-dev-role. Use radar-admin-nonprod to create nonprod resources, or radar-admin-prod to create prod resources."
    profile = _resource_profile_name(account)
    if not profile:
        return False, "Use radar-admin-nonprod for account 963334842848, or radar-admin-prod for account 471550468381."
    remember_checkout(
        credentials,
        user,
        identity=identity,
        path=_deploy_path(),
        profile=profile,
    )
    expires = _chicago((_read_path(_deploy_path()) or {}).get("expires_at"))
    detail = " ".join(part for part in (account, role) if part)
    try:
        _replace_aws_profile(profile, credentials)
    except OSError as error:
        return True, f"Session saved until {expires}. {detail}. The CLI profile {profile} was not replaced: {error}".strip()
    return True, f"Session saved until {expires}. {detail}. CLI profile {profile} was replaced.".strip()


def session_summary():
    return _summary(_read_shared(), shared_credentials() is not None)


def deployment_credentials():
    """Checkout used to create AWS resources. Nonprod uses radar-admin-nonprod; prod uses radar-admin-prod."""
    stored = _read_path(_deploy_path())
    if _role_name((stored or {}).get("arn") or "") == "radar-dev-role":
        return None
    return _credentials_from_store(stored)


def deployment_session_summary():
    stored = _read_path(_deploy_path()) or {}
    summary = _summary(stored, deployment_credentials() is not None)
    if _role_name(stored.get("arn") or "") == "radar-dev-role":
        summary["profile"] = "radar-dev-prod" if stored.get("account") == "471550468381" else "radar-dev-nonprod"
    else:
        summary["profile"] = stored.get("profile") or ""
    summary["obtained_at"] = _chicago(stored.get("obtained_at"))
    summary["guidance"] = _checkout_guidance(summary)
    return summary


def _checkout_guidance(summary):
    profile = summary.get("profile") or ""
    expires = summary.get("expires_at") or ""
    account = summary.get("account") or ""
    if summary.get("active") and profile and expires:
        where = f" for account {account}" if account else ""
        return f"{profile} is checked out{where} until {expires}. Paste a new credential export here to replace it."
    if profile and expires:
        return (
            f"The {profile} checkout ended {expires}. "
            "Check out radar-admin-nonprod to create nonprod AWS resources, or radar-admin-prod to create prod AWS resources. "
            "Copy the credential export and paste it here."
        )
    return (
        "Check out radar-admin-nonprod to create nonprod AWS resources, or radar-admin-prod to create prod AWS resources. "
        "Copy the credential export and paste it here."
    )


def _summary(stored, active):
    stored = stored or {}
    key = stored.get("aws_access_key_id") or ""
    hint = f"{key[:4]}…{key[-4:]}" if len(key) >= 8 else ""
    return {
        "active": active,
        "expires_at": _chicago(stored.get("expires_at")),
        "actor": stored.get("actor") or "",
        "account": stored.get("account") or "",
        "role": _role_name(stored.get("arn") or ""),
        "key_hint": hint,
        "profile": stored.get("profile") or "",
    }


def _replace_aws_profile(profile, credentials):
    """Replace one profile in the AWS CLI credentials file. Other profiles stay as they are."""
    path = Path.home() / ".aws" / "credentials"
    path.parent.mkdir(parents=True, exist_ok=True)
    current = path.read_text(encoding="utf-8") if path.exists() else ""
    block = "\n".join((
        f"[{profile}]",
        f"aws_access_key_id = {credentials['aws_access_key_id']}",
        f"aws_secret_access_key = {credentials['aws_secret_access_key']}",
        f"aws_session_token = {credentials['aws_session_token']}",
        "",
    ))
    pattern = re.compile(rf"(?ms)^\[{re.escape(profile)}\]\n.*?(?=^\[|\Z)")
    updated = pattern.sub(block, current) if pattern.search(current) else current.rstrip() + "\n\n" + block
    temporary = path.with_suffix(".credentials.tmp")
    temporary.write_text(updated if updated.endswith("\n") else updated + "\n", encoding="utf-8")
    try:
        os.chmod(temporary, 0o600)
    except OSError:
        pass
    temporary.replace(path)


def _credentials_from_store(stored):
    if not stored:
        return None
    try:
        expires = datetime.fromisoformat(stored.get("expires_at") or "")
    except ValueError:
        return None
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= datetime.now(timezone.utc):
        return None
    credentials = {
        "aws_access_key_id": stored.get("aws_access_key_id") or "",
        "aws_secret_access_key": stored.get("aws_secret_access_key") or "",
    }
    if stored.get("aws_session_token"):
        credentials["aws_session_token"] = stored["aws_session_token"]
    if not credentials["aws_access_key_id"] or not credentials["aws_secret_access_key"]:
        return None
    return credentials


def _caller_identity(credentials):
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    try:
        return boto3.client("sts", region_name="us-east-1", **credentials).get_caller_identity()
    except (BotoCoreError, ClientError) as error:
        raise BritiveError("AWS rejected these credentials.") from error


def _role_name(arn):
    marker = ":assumed-role/"
    if marker not in arn:
        return ""
    return arn.split(marker, 1)[1].split("/", 1)[0]


def _chicago(value):
    if not value:
        return ""
    try:
        moment = datetime.fromisoformat(value)
    except ValueError:
        return ""
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    from zoneinfo import ZoneInfo

    return moment.astimezone(ZoneInfo("America/Chicago")).strftime("%b %-d, %Y %-I:%M %p CST")


def remember_checkout(credentials, user=None, hours=8, identity=None, path=None, profile=""):
    now = datetime.now(timezone.utc)
    actor = ""
    if user is not None and getattr(user, "is_authenticated", False):
        actor = (getattr(user, "email", "") or getattr(user, "get_username", lambda: "")() or "").strip()
    payload = {
        "obtained_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=hours)).isoformat(),
        "actor": actor,
        "profile": profile,
        "account": (identity or {}).get("Account") or "",
        "arn": (identity or {}).get("Arn") or "",
        "aws_access_key_id": credentials.get("aws_access_key_id") or "",
        "aws_secret_access_key": credentials.get("aws_secret_access_key") or "",
        "aws_session_token": credentials.get("aws_session_token") or "",
    }
    path = path or _shared_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload), encoding="utf-8")
    temporary.replace(path)
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass


def boto3_client(service, region):
    import boto3

    kwargs = aws_client_kwargs()
    if kwargs:
        return boto3.client(service, region_name=region, **kwargs)
    return boto3.client(service, region_name=region)


def boto3_session():
    import boto3

    kwargs = aws_client_kwargs()
    if kwargs:
        return boto3.session.Session(**kwargs)
    return boto3.session.Session()


def profiles_from(payload):
    rows = payload
    if isinstance(payload, dict):
        rows = payload.get("data") or payload.get("result") or payload.get("profiles") or []
    found = []
    if not isinstance(rows, list):
        return found
    for item in rows:
        if not isinstance(item, dict):
            continue
        name = str(item.get("papName") or item.get("profileName") or item.get("name") or "")
        profile_id = str(item.get("papId") or item.get("profileId") or item.get("id") or "")
        environments = item.get("environments") or item.get("environmentList") or []
        if isinstance(environments, list) and environments:
            for environment in environments:
                if not isinstance(environment, dict):
                    continue
                found.append({
                    "name": name,
                    "profile_id": profile_id,
                    "environment_id": str(environment.get("environmentId") or environment.get("id") or ""),
                })
            continue
        found.append({
            "name": name,
            "profile_id": profile_id,
            "environment_id": str(item.get("environmentId") or item.get("envId") or ""),
        })
    return found


def credentials_from(payload):
    values = payload
    if isinstance(payload, dict) and isinstance(payload.get("credentials"), dict):
        values = payload["credentials"]
    if isinstance(payload, list):
        values = {}
        for item in payload:
            if isinstance(item, dict):
                key = item.get("name") or item.get("key")
                if key:
                    values[str(key)] = item.get("value") or ""
    if not isinstance(values, dict):
        raise BritiveError("Britive did not return AWS credentials.")
    lowered = {str(key).lower(): value for key, value in values.items()}

    def pick(*names):
        for name in names:
            if values.get(name):
                return values[name]
            if lowered.get(name.lower()):
                return lowered[name.lower()]
        return ""

    access_key = pick("accessKeyId", "AccessKeyId", "AWS_ACCESS_KEY_ID")
    secret_key = pick("secretAccessKey", "SecretAccessKey", "AWS_SECRET_ACCESS_KEY")
    session_token = pick("sessionToken", "SessionToken", "AWS_SESSION_TOKEN")
    if not access_key or not secret_key:
        raise BritiveError("Britive did not return AWS credentials.")
    credentials = {
        "aws_access_key_id": access_key,
        "aws_secret_access_key": secret_key,
    }
    if session_token:
        credentials["aws_session_token"] = session_token
    return credentials


def _shared_path():
    from django.conf import settings

    return Path(settings.BASE_DIR) / "data" / "aws_checkout.json"


def _deploy_path():
    from django.conf import settings

    return Path(settings.BASE_DIR) / "data" / "aws_deploy_checkout.json"


def _read_path(path):
    try:
        stored = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return stored if isinstance(stored, dict) else None


def _read_shared():
    try:
        stored = json.loads(_shared_path().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return stored if isinstance(stored, dict) else None


def deployment_profile_name():
    """Britive profile that creates nonprod AWS resources."""
    return os.getenv("BRITIVE_DEPLOY_PROFILE", "radar-admin-nonprod").strip() or "radar-admin-nonprod"


def _resource_profile_name(account):
    if account == "471550468381":
        return os.getenv("BRITIVE_PROD_PROFILE", "radar-admin-prod").strip() or "radar-admin-prod"
    if account == "963334842848":
        return deployment_profile_name()
    return ""


def _profile_name():
    """Britive profile for staff sign-in. Resource creation uses the admin profiles."""
    explicit = os.getenv("BRITIVE_PROFILE", "").strip()
    if explicit:
        return explicit
    environment = (os.getenv("APP_ENV") or os.getenv("DJANGO_ENV") or "local").strip().lower()
    if environment == "prod":
        return "radar-dev-prod"
    return "radar-dev-nonprod"


def _find_profile(name):
    wanted = name.casefold()
    matches = [item for item in profiles_from(_get("/api/access")) if item["name"].casefold() == wanted]
    if not matches:
        raise BritiveError(f"Britive profile {name} is not available to this app.")
    chosen = next((item for item in matches if item["profile_id"] and item["environment_id"]), None)
    if chosen is None:
        raise BritiveError(f"Britive profile {name} has no environment to check out.")
    return chosen


def _checkout(profile_id, environment_id):
    path = f"/api/access/{quote(profile_id)}/environments/{quote(environment_id)}?accessType=PROGRAMMATIC"
    status = _post(path, {"justification": "GDX application access"})
    for _ in range(10):
        state = str(status.get("status") or "")
        if state == "checkedOut":
            return status
        if state in {"checkOutFailed", "checkOutTimeOut"}:
            raise BritiveError(status.get("errorMessage") or "Britive could not check out the AWS profile.")
        time.sleep(1)
        transaction_id = status.get("transactionId")
        if not transaction_id:
            break
        status = _get(f"/api/access/{quote(str(transaction_id))}")
    if str(status.get("status") or "") != "checkedOut":
        raise BritiveError("Britive did not finish checking out the AWS profile.")
    return status


def _tokens(transaction_id):
    return _get(f"/api/access/{quote(str(transaction_id))}/tokens")


def _credentials(payload):
    return credentials_from(payload)


def _expires_at(status):
    raw = str(status.get("expiration") or "")
    if raw:
        try:
            from datetime import datetime

            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            return max(time.time() + 30, parsed.timestamp() - 60)
        except ValueError:
            pass
    return time.time() + 600


def _base_url():
    return os.getenv("BRITIVE_BASE_URL", "https://tmna.britive-app.com").strip().rstrip("/")


def _token():
    return os.getenv("BRITIVE_API_TOKEN", "").strip()


def _request(method, path, body=None):
    url = _base_url() + path
    data = None if body is None else json.dumps(body).encode()
    request = Request(url, data=data, method=method, headers={
        "Authorization": f"TOKEN {_token()}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    })
    try:
        with urlopen(request, timeout=20, context=_ssl_context()) as response:
            raw = response.read().decode()
    except HTTPError as error:
        if error.code in (401, 403):
            raise BritiveError("Britive rejected the app token.") from error
        raise BritiveError("Britive could not be reached.") from error
    except (URLError, TimeoutError):
        raise BritiveError("Britive could not be reached.") from None
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError as error:
        raise BritiveError("Britive returned an unreadable response.") from error


def _get(path):
    return _request("GET", path)


def _post(path, body):
    return _request("POST", path, body)


def _ssl_context():
    try:
        import ssl
        import certifi
    except ImportError:
        return None
    return ssl.create_default_context(cafile=certifi.where())
