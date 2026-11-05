from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "tbdp_pods"
    display_name = "TBDP Pods"
    description = "TDSP pod dropdown for dataset checkout requests."
    default_source_name = "OneTS"
    icon_path = "images/brands/modules/servicenow.png"
    url_prefix = "tbdp-pods/"
    frontend_path = "dropdown/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "OneTS"
    upstream_method = "GET"
    tags = ("TBDP Pods", "TDSP")
    endpoints = (
        {
            "name": "TDSP pod dropdown",
            "route_name": "tbdp_pods:dropdown",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
    )

    def public_endpoint(self):
        return "/api/integrations/tbdp-pods/dropdown/"


registry.register(Module())
