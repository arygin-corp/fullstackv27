import os

from django.core.management.base import BaseCommand

from ...models import (
    APIConfiguration,
    APIParameter,
)


class Command(BaseCommand):
    help = (
        "Create or update starter API configurations."
    )

    @staticmethod
    def env_exists(name):
        return bool(os.getenv(name))

    def create_or_update_api(
        self,
        *,
        defaults,
        parameters=None,
    ):
        parameters = parameters or {}

        from urllib.parse import urlparse
        slug = defaults["slug"]
        version = int(defaults.pop("version", 1))
        host = urlparse(defaults["base_url"]).hostname
        defaults.setdefault("environment", APIConfiguration.Environment.DEV)
        defaults.setdefault("owner_team", "Platform Engineering")
        defaults.setdefault("approved_hosts", [host] if host else [])
        defaults.setdefault("allowed_content_types", ["application/json"])
        defaults.setdefault("lifecycle", "active" if defaults.get("active") else "draft")

        config, _ = (
            APIConfiguration.objects
            .update_or_create(
                slug=slug,
                version=version,
                defaults=defaults,
            )
        )

        # Force model validation
        config.full_clean()
        config.save()

        for key, value in parameters.items():
            APIParameter.objects.update_or_create(
                configuration=config,
                key=key,
                defaults={
                    "upstream_name": key,
                    "location": "query",
                    "data_type": "string",
                    "client_supplied": False,
                    "value": value,
                    "active": True,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Configured {config.slug} "
                f"(active={config.active})"
            )
        )

        return config

    def handle(self, *args, **options):

        definitions = [

            #
            # TDSP Pods
            #
            {
                "defaults": {
                    "slug": "tdsp-pods",
                    "name": "TDSP Pods",
                    "base_url": (
                        "https://tmna.service-now.com/"
                        "api/now/table/"
                    ),
                    "endpoint":
                        "u_toyota_data_science_platform",
                    "http_method": "GET",
                    "auth_type": "basic",
                    "username_env_var":
                        "ONETS_USERNAME",
                    "password_env_var":
                        "ONETS_PASSWORD",
                    "response_path": "result",
                    "cache_seconds": 300,
                    "active": True,
                    "default_headers": {
                        "Accept": "application/json",
                    },
                },

                "parameters": {
                    "sysparm_query": "u_type=pod",
                    "sysparm_fields": "u_primary",
                    "sysparm_limit": "1000",
                },
            },

            #
            # ServiceNow Submit Cart
            #
            {
                "defaults": {
                    "slug": "servicenow-submit-cart",
                    "name": "ServiceNow Submit Cart",
                    "base_url":
                        "https://tmna.service-now.com/",
                    "endpoint":
                        "api/sn_sc/servicecatalog/"
                        "cart/submit_dar_order",
                    "http_method": "POST",
                    "auth_type": "basic",
                    "username_env_var":
                        "ONETS_USERNAME",
                    "password_env_var":
                        "ONETS_PASSWORD",
                    "response_path": "result",
                    "timeout_seconds": 15,
                    "retry_attempts": 3,
                    "active": True,
                    "default_headers": {
                        "Accept": "application/json",
                    },
                }
            },

            #
            # ServiceNow Add To Cart
            #
            {
                "defaults": {
                    "slug": "servicenow-add-to-cart",
                    "name": "ServiceNow Add To Cart",
                    "base_url": (
                        os.getenv("SN_BASE_URL")
                        or
                        "https://tmna.service-now.com/api/"
                    ),
                    "endpoint": (
                        os.getenv(
                            "SN_ADD_TO_CART_PATH"
                        )
                        or
                        "sn_sc/servicecatalog/items/"
                        "CONFIGURE_ITEM_SYS_ID/"
                        "add_to_cart"
                    ),
                    "http_method": "POST",
                    "auth_type": "basic",
                    "username_env_var":
                        "ONETS_USERNAME",
                    "password_env_var":
                        "ONETS_PASSWORD",
                    "response_path": "result",
                    "timeout_seconds": 30,
                    "retry_attempts": 3,
                    "active": self.env_exists(
                        "SN_ADD_TO_CART_PATH"
                    ),
                    "default_headers": {
                        "Accept": "application/json",
                    },
                }
            },

            #
            # Attachment Upload
            #
            {
                "defaults": {
                    "slug":
                        "servicenow-attachment-upload",

                    "name":
                        "ServiceNow Attachment Upload",

                    "base_url":
                        "https://tmna.service-now.com/"
                        "api/now/attachment/",

                    "endpoint":
                        "upload",

                    "http_method":
                        "POST",

                    "auth_type":
                        "basic",

                    "username_env_var":
                        "ONETS_USERNAME",

                    "password_env_var":
                        "ONETS_PASSWORD",

                    "response_path":
                        "result",

                    "timeout_seconds":
                        30,

                    "active":
                        True,

                    "default_headers": {
                        "Accept":
                            "application/json",
                    },
                }
            },

            #
            # Request Search
            #
            {
                "defaults": {
                    "slug":
                        "servicenow-request-search",

                    "name":
                        "ServiceNow Request Search",

                    "base_url":
                        os.getenv(
                            "SNOW_API_URL"
                        )
                        or
                        "https://tmna.service-now.com/api/",

                    "endpoint":
                        os.getenv(
                            "SNOW_REQUEST_ENDPOINT"
                        )
                        or
                        "CONFIGURE_REQUEST_ENDPOINT",

                    "http_method":
                        "GET",

                    "auth_type":
                        "basic",

                    "username_env_var":
                        "ONETS_USERNAME",

                    "password_env_var":
                        "ONETS_PASSWORD",

                    "response_path":
                        "result",

                    "active":
                        self.env_exists(
                            "SNOW_REQUEST_ENDPOINT"
                        ),
                },

                "parameters": {
                    "sysparm_display_value":
                        "true",

                    "sysparm_exclude_reference_link":
                        "true",
                },
            },

            #
            # Request Details
            #
            {
                "defaults": {
                    "slug":
                        "servicenow-request-details",

                    "name":
                        "ServiceNow Request Details",

                    "base_url":
                        os.getenv(
                            "SNOW_API_URL"
                        )
                        or
                        "https://tmna.service-now.com/api/",

                    "endpoint":
                        os.getenv(
                            "SNOW_DAR_ENDPOINT"
                        )
                        or
                        "CONFIGURE_DAR_ENDPOINT",

                    "http_method":
                        "GET",

                    "auth_type":
                        "basic",

                    "username_env_var":
                        "ONETS_USERNAME",

                    "password_env_var":
                        "ONETS_PASSWORD",

                    "response_path":
                        "result",

                    "active":
                        self.env_exists(
                            "SNOW_DAR_ENDPOINT"
                        ),
                }
            },

            #
            # Metadata Views Token
            #
            {
                "defaults": {
                    "slug":
                        "metadata-views-token",

                    "name":
                        "Metadata Views Token",

                    "base_url":
                        os.getenv(
                            "METADATA_VIEW_AUTH_ENDPOINT"
                        )
                        or
                        "https://configure.invalid/",

                    "endpoint":
                        "",

                    "http_method":
                        "POST",

                    "auth_type":
                        "none",

                    "response_path":
                        "",

                    "active":
                        (
                            self.env_exists(
                                "METADATA_VIEW_AUTH_ENDPOINT"
                            )
                            and
                            self.env_exists(
                                "METADATA_VIEWS_CLIENT_ID"
                            )
                        ),
                }
            },

            #
            # Metadata Views
            #
            {
                "defaults": {
                    "slug":
                        "metadata-views",

                    "name":
                        "Metadata Views",

                    "base_url":
                        os.getenv(
                            "VIEWS_END_POINT"
                        )
                        or
                        "https://configure.invalid/",

                    "endpoint":
                        "",

                    "http_method":
                        "GET",

                    "auth_type":
                        "none",

                    "response_path":
                        "",

                    "active":
                        self.env_exists(
                            "VIEWS_END_POINT"
                        ),
                }
            },

            #
            # Microsoft Graph
            #
            {
                "defaults": {
                    "slug":
                        "graph-users",

                    "name":
                        "Microsoft Graph Users",

                    "base_url":
                        "https://graph.microsoft.com",

                    "endpoint":
                        "v1.0/users",

                    "http_method":
                        "GET",

                    "auth_type":
                        "none",

                    "response_path":
                        "",

                    "cache_seconds":
                        60,

                    "active":
                        (
                            self.env_exists(
                                "PEOPLE_FINDER_CLIENT_ID"
                            )
                            and
                            self.env_exists(
                                "PEOPLE_FINDER_CLIENT_SECRET"
                            )
                            and
                            self.env_exists(
                                "PEOPLE_FINDER_TENANT_ID"
                            )
                        ),
                },

                "parameters": {
                    "$count": "true",
                },
            },

            #
            # Axon Token
            #
            {
                "defaults": {
                    "slug":
                        "axon-token",

                    "name":
                        "Axon Token",

                    "base_url":
                        os.getenv(
                            "AXON_END_POINT"
                        )
                        or
                        "https://configure.invalid/",

                    "endpoint":
                        "",

                    "http_method":
                        "POST",

                    "auth_type":
                        "none",

                    "response_path":
                        "",

                    "active":
                        (
                            self.env_exists(
                                "AXON_END_POINT"
                            )
                            and
                            self.env_exists(
                                "AXON_CLIENT_ID"
                            )
                        ),
                }
            },

            #
            # Axon Search
            #
            {
                "defaults": {
                    "slug":
                        "axon-facet-search",

                    "name":
                        "Axon Facet Search",

                    "base_url":
                        os.getenv(
                            "FACETSEARCH_END_POINT"
                        )
                        or
                        "https://configure.invalid/",

                    "endpoint":
                        "",

                    "http_method":
                        "POST",

                    "auth_type":
                        "none",

                    "response_path":
                        "",

                    # Leave disabled until
                    # request_template is defined
                    "request_template":
                        {},

                    "active":
                        False,
                }
            },
        ]

        for definition in definitions:

            self.create_or_update_api(
                defaults=definition["defaults"],
                parameters=definition.get(
                    "parameters",
                    {},
                ),
            )