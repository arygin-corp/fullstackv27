import os
from .exceptions import ExternalApiConfigurationError

def resolve_credential(reference):
    if reference is None or not reference.active:
        raise ExternalApiConfigurationError("An active credential reference is required.")
    if reference.provider == reference.Provider.ENVIRONMENT:
        value = os.getenv(reference.reference)
        if not value:
            raise ExternalApiConfigurationError(f"Credential environment reference {reference.reference!r} is not configured.")
        return value
    raise ExternalApiConfigurationError(f"Credential provider {reference.provider!r} requires a configured provider adapter.")
