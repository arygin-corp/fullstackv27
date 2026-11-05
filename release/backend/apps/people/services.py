from urllib.parse import parse_qs, urlparse
from apps.external_apis.exceptions import (ExternalApiConfigurationError, ExternalApiRequestError,)
from .graph_services import next_users, search_users, graph_base, _get



class PeopleDirectoryError(RuntimeError):
    """An upstream directory configuration or request failed."""


class InvalidPeopleCursor(ValueError):
    """The caller supplied an invalid or unapproved pagination cursor."""


FILTER_FIELDS = {
    "department": "department",
    "company_name": "companyName",
    "office_location": "officeLocation",
    "job_title": "jobTitle",
    "display_name": "displayName",
}

SORT_FIELDS = {
    "display_name": "displayName",
    "given_name": "givenName",
    "surname": "surname",
    "department": "department",
    "job_title": "jobTitle",
    "office_location": "officeLocation",
    "user_principal_name": "userPrincipalName",
}

DEFAULT_SELECT = [
    "id",
    "displayName",
    "givenName",
    "surname",
    "jobTitle",
    "userPrincipalName",
    "mail",
    "accountEnabled",
    "businessPhones",
    "officeLocation",
    "department",
    "companyName",
]


def _next_skip_token(next_link):
    if not next_link:
        return None
    values = parse_qs(urlparse(next_link).query).get("$skiptoken")
    return values[0] if values else None


def search_people(request, query, page_size=10):
    try:
        data = search_users(
            request,
            {
                "search": {
                    "displayName": query,
                    "mail": query,
                    "userPrincipalName": query,
                },
                "select": DEFAULT_SELECT,
                "top": page_size,
            },
        )
        return data.get("value", [])
    except (ExternalApiConfigurationError, ExternalApiRequestError, ValueError) as exc:
        raise PeopleDirectoryError(str(exc)) from exc


def list_people(
    request,
    *,
    page_size=100,
    cursor=None,
    filters=None,
    sort_by="display_name",
    sort_dir="asc",
):
    if sort_by not in SORT_FIELDS:
        raise ValueError(f"Unsupported sort field: {sort_by}")
    if sort_dir not in {"asc", "desc"}:
        raise ValueError("sort_dir must be 'asc' or 'desc'")

    filters = filters or {}
    graph_filters = {
        FILTER_FIELDS[key]: value
        for key, value in filters.items()
        if key in FILTER_FIELDS and value not in (None, "")
    }
    if filters.get("account_enabled") is not None:
        graph_filters["accountEnabled"] = filters["account_enabled"]

    if cursor:
        try:
            data = next_users(request, cursor)
        except ValueError as exc:
            raise InvalidPeopleCursor(str(exc)) from exc
        except (ExternalApiConfigurationError, ExternalApiRequestError) as exc:
            raise PeopleDirectoryError(str(exc)) from exc
    else:
        try:
            data = search_users(
                request,
                {
                    "filter": graph_filters,
                    "select": DEFAULT_SELECT,
                    "sort": [f"{SORT_FIELDS[sort_by]} {sort_dir}"],
                    "top": page_size,
                },
            )
        except (ExternalApiConfigurationError, ExternalApiRequestError, ValueError) as exc:
            raise PeopleDirectoryError(str(exc)) from exc

    next_link = data.get("@odata.nextLink")
    return {
        "results": data.get("value", []),
        "total_count": data.get("@odata.count"),
        "next_cursor": next_link,
        "next_skip_token": _next_skip_token(next_link),
    }

