import ipaddress
import socket
from urllib.parse import urlparse
from .exceptions import ExternalApiConfigurationError

BLOCKED_HOSTS = {"169.254.169.254", "metadata.google.internal"}

def validate_destination(url, approved_hosts):
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ExternalApiConfigurationError("Only HTTPS upstream URLs are permitted.")
    host = (parsed.hostname or "").casefold()
    approved = {str(value).casefold().split("://")[-1].split("/")[0].split(":")[0] for value in approved_hosts or []}
    if not host or host not in approved or host in BLOCKED_HOSTS:
        raise ExternalApiConfigurationError("The upstream host is not approved.")
    try:
        addresses = socket.getaddrinfo(host, parsed.port or 443, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ExternalApiConfigurationError("The upstream host could not be resolved.") from exc
    for info in addresses:
        address = ipaddress.ip_address(info[4][0])
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved or address.is_multicast or address.is_unspecified:
            raise ExternalApiConfigurationError("The upstream host resolves to a restricted address.")
    return host
