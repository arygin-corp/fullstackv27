from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    """Master-module registration for the centralized AWS integration catalog."""

    key = "aws"
    display_name = "AWS Integrations"

    description = (
        "Centralized AWS integration catalog, resource health, dependencies, "
        "capabilities, audit history, and Demo/Dev/Stage/QA/Prod parity."
    )

    default_source_name = "Amazon Web Services"

    icon_path = "images/brands/modules/aws.png"

    url_prefix = "aws/"
    frontend_path = ""
    frontend_method = "GET"
    frontend_authentication = "Django authentication"

    upstream_provider = "Amazon Web Services"
    upstream_method = "Service-specific through registered AWS adapters"
    upstream_endpoint_setting = ""

    upstream_authentication = (
        "External AWS runtime identity; credentials are not managed by this module"
    )

    required_setting_names = ()
    required_secret_names = ()
    optional_setting_names = ()

    defaulted_settings = {}
    cache_entries = ()
    default_config = {}

    tags = (
        "AWS",
        "Cloud",
        "Integration Catalog",
        "Health",
        "Environment Parity",
    )

    # Documentation / ownership
    documentation_url = ""
    owner = ""
    version = ""
    health_check = ""

    # ---------------------------------------------------------
    # Composite module management
    # ---------------------------------------------------------

    management_route_name = "third_party_api_aws:index"

    managed_resources = (
        "api_gateway",
        "athena",
        "aurora",
        "bedrock",
        "cloudformation",
        "cloudfront",
        "cloudtrail",
        "cloudwatch",
        "dynamodb",
        "ec2",
        "ecr",
        "ecs",
        "eks",
        "emr",
        "eventbridge",
        "fargate",
        "glue",
        "iam",
        "kms",
        "lambda",
        "rds",
        "redshift",
        "route53",
        "s3",
        "sagemaker",
        "secrets_manager",
        "ses",
        "sns",
        "sqs",
        "step_functions",
    )

    presentation = {
        "card": {
            "fields": (
                {
                    "label": "Provider",
                    "source": "upstream.provider",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Resources",
                    "source": "managed_resource_count",
                    "format": "number",
                    "hide_if_empty": True,
                },
                {
                    "label": "Authentication",
                    "source": "upstream.authentication",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Health",
                    "source": "health.status",
                    "format": "status",
                    "hide_if_empty": True,
                },
            ),
        },
        "settings": {
            "sections": (
                "status",
                "governance",
                "environments",
                "upstream",
                "resources",
                "configuration",
                "health",
            ),
        },
        "documentation": {
            "sections": (
                "governance",
                "capabilities",
                "environments",
                "endpoints",
                "upstream",
                "resources",
                "configuration",
                "health",
            ),
        },
    }

    def render_operation_page(self, request, page_key):
        from .page_views import render_aws_page

        return render_aws_page(request, page_key)

    @property
    def urlpatterns(self):
        # Lazy import avoids loading Django URL/view modules
        # during registry discovery.
        from .urls import urlpatterns

        return urlpatterns


registry.register(Module())