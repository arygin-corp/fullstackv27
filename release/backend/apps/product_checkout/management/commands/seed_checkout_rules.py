from django.core.management.base import BaseCommand
from django.db import transaction

from apps.product_checkout.models import (
    FieldType,
    ProductCheckoutCondition,
    ProductCheckoutConfiguration,
    ProductCheckoutFieldAction,
    ProductCheckoutRoutingRule,
    ProductCheckoutRuleGroup,
    ProductCheckoutValidationRule,
    ProductQuestion,
    ProductQuestionOption,
)

SENSITIVE = [
    "Confidential",
    "Highly Confidential",
    "Personal Information",
    "Legal/Privileged",
]

YES_NO = [
    {"label": "Yes", "value": "Yes"},
    {"label": "No", "value": "No"},
]


class Command(BaseCommand):
    help = "Seed Product Checkout questions, rules, validation, and routing."

    def add_arguments(self, parser):
        parser.add_argument("product_ref")
        parser.add_argument("--product-model", default="")

    @transaction.atomic
    def handle(self, *args, **options):
        configuration, _ = ProductCheckoutConfiguration.objects.update_or_create(
            product_ref=options["product_ref"],
            defaults={
                "product_model": options["product_model"],
                "is_active": True,
                "allow_other_user": True,
                "allow_service_account": True,
                "requires_terms": True,
            },
        )

        self.seed_questions(configuration)
        self.seed_rule_groups(configuration)
        self.seed_validation_rules(configuration)
        self.seed_routing_rules(configuration)

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded Product Checkout questions, rules, validation, and "
                f"routing for product {configuration.product_ref}."
            )
        )

    def seed_questions(self, configuration):
        question_specs = [
            {
                "key": "requesting_id",
                "label": "Who are you requesting access for?",
                "field_type": FieldType.SELECT,
                "required": True,
                "default_value": "Me",
                "order": 10,
                "metadata": {"section": "request_details"},
                "options": [
                    {"label": "Me", "value": "Me"},
                    {"label": "Another User", "value": "User"},
                    {"label": "Service Account", "value": "Service Account"},
                ],
            },
            {
                "key": "v_dar_objectid_reqfor",
                "label": "Requested For",
                "field_type": FieldType.USER_LOOKUP,
                "help_text": "Select the user who requires access.",
                "placeholder": "Search for a user",
                "order": 20,
                "metadata": {"section": "request_details"},
            },
            {
                "key": "v_dar_service_account",
                "label": "Service Account",
                "field_type": FieldType.TEXT,
                "help_text": "Enter the service account that requires access.",
                "placeholder": "Enter service account",
                "order": 30,
                "metadata": {"section": "request_details"},
            },
            {
                "key": "v_dar_accessType",
                "label": "Access Type",
                "field_type": FieldType.SELECT,
                "order": 40,
                "metadata": {"section": "request_details"},
                "options": [
                    {"label": "User", "value": "User"},
                    {"label": "Application", "value": "Application"},
                ],
            },
            {
                "key": "requesting_tdsp_processing",
                "label": "Will this request involve TDSP processing?",
                "field_type": FieldType.SELECT,
                "required": True,
                "default_value": "No",
                "order": 50,
                "metadata": {"section": "processing"},
                "options": YES_NO,
            },
            {
                "key": "appropriateTDSPPod",
                "label": "Appropriate TDSP Pod",
                "field_type": FieldType.SELECT,
                "help_text": "Select the appropriate TDSP pod.",
                "placeholder": "Select a TDSP pod",
                "order": 60,
                "metadata": {
                    "section": "processing",
                    "options_source": "tdsp_pods",
                },
            },
            {
                "key": "v_dar_accessReqClassification",
                "label": "Access Request Classification",
                "field_type": FieldType.SELECT,
                "help_text": "Select the classification of the requested data.",
                "placeholder": "Select a classification",
                "required": True,
                "order": 70,
                "metadata": {"section": "data_classification"},
                "options": [
                    {"label": value, "value": value}
                    for value in [
                        "Public",
                        "Protected",
                        "Confidential",
                        "Highly Confidential",
                        "Personal Information",
                        "Legal/Privileged",
                    ]
                ],
            },
            {
                "key": "v_dar_pi",
                "label": "Does this request include Personal Information?",
                "field_type": FieldType.SELECT,
                "order": 80,
                "metadata": {"section": "data_classification"},
                "options": YES_NO,
            },
            {
                "key": "v_dar_spi",
                "label": "Does this request include Sensitive Personal Information?",
                "field_type": FieldType.SELECT,
                "order": 90,
                "metadata": {"section": "data_classification"},
                "options": YES_NO,
            },
            {
                "key": "edm_PI_personal_details",
                "label": "Will personal details be accessed?",
                "field_type": FieldType.SELECT,
                "order": 100,
                "metadata": {"section": "personal_information"},
                "options": YES_NO,
            },
            {
                "key": "v_edm_type_of_work",
                "label": "Type of Work",
                "field_type": FieldType.TEXT,
                "help_text": "Describe the work that requires PI or SPI access.",
                "placeholder": "Enter the type of work",
                "order": 110,
                "metadata": {"section": "personal_information"},
            },
            {
                "key": "v_edm_3rd_party_vendor",
                "label": "Third-Party Vendor",
                "field_type": FieldType.TEXT,
                "help_text": "Enter the third-party vendor, if applicable.",
                "placeholder": "Enter vendor name",
                "order": 120,
                "metadata": {"section": "personal_information"},
            },
            {
                "key": "v_emd_specify_PII_needs",
                "label": "Sensitive PI Business Use Case",
                "field_type": FieldType.TEXTAREA,
                "help_text": "Explain why access to personal details is required.",
                "placeholder": "Describe the business use case",
                "min_length": 6,
                "max_length": 200,
                "order": 130,
                "metadata": {"section": "personal_information", "rows": 4},
            },
            {
                "key": "v_dar_businessJustification",
                "label": "Intended Use",
                "field_type": FieldType.TEXTAREA,
                "help_text": "Explain how the product or data will be used.",
                "placeholder": "Describe the intended use",
                "required": True,
                "min_length": 6,
                "max_length": 200,
                "order": 140,
                "metadata": {"section": "justification", "rows": 4},
            },
            {
                "key": "v_dar_DataReqDescription",
                "label": "Data Request Description",
                "field_type": FieldType.TEXTAREA,
                "help_text": "Describe the data being requested.",
                "placeholder": "Describe the requested data",
                "required": True,
                "order": 150,
                "metadata": {"section": "justification", "rows": 4},
            },
            {
                "key": "v_dar_organization",
                "label": "Organization",
                "field_type": FieldType.TEXT,
                "placeholder": "Enter organization",
                "order": 160,
                "metadata": {"section": "routing"},
            },
            {
                "key": "chk_dar_terms_message",
                "label": "I agree to the Terms of Use",
                "field_type": FieldType.CHECKBOX,
                "required": True,
                "default_value": False,
                "order": 900,
                "metadata": {"section": "terms"},
            },
        ]

        seeded_keys = set()
        for spec in question_specs:
            data = spec.copy()
            option_specs = data.pop("options", [])
            key = data.pop("key")
            seeded_keys.add(key)

            question, _ = ProductQuestion.objects.update_or_create(
                configuration=configuration,
                key=key,
                defaults={
                    "label": data.pop("label"),
                    "field_type": data.pop("field_type"),
                    "help_text": data.pop("help_text", ""),
                    "placeholder": data.pop("placeholder", ""),
                    "required": data.pop("required", False),
                    "default_value": data.pop("default_value", None),
                    "min_length": data.pop("min_length", None),
                    "max_length": data.pop("max_length", None),
                    "regex_pattern": data.pop("regex_pattern", ""),
                    "order": data.pop("order", 0),
                    "metadata": data.pop("metadata", {}),
                    "is_active": True,
                },
            )

            active_values = []
            for option_order, option_spec in enumerate(option_specs):
                active_values.append(option_spec["value"])
                ProductQuestionOption.objects.update_or_create(
                    question=question,
                    value=option_spec["value"],
                    defaults={
                        "label": option_spec["label"],
                        "order": option_order,
                        "is_active": True,
                    },
                )

            question.options.exclude(value__in=active_values).update(is_active=False)

        configuration.questions.exclude(key__in=seeded_keys).update(is_active=False)

    def upsert_group(
        self,
        configuration,
        name,
        priority,
        conditions,
        actions,
        evaluation_mode="all",
    ):
        group, _ = ProductCheckoutRuleGroup.objects.update_or_create(
            configuration=configuration,
            name=name,
            defaults={
                "evaluation_mode": evaluation_mode,
                "priority": priority,
                "is_active": True,
            },
        )
        group.conditions.all().delete()
        group.actions.all().delete()

        ProductCheckoutCondition.objects.bulk_create(
            [
                ProductCheckoutCondition(
                    group=group,
                    order=order,
                    is_active=True,
                    **condition,
                )
                for order, condition in enumerate(conditions)
            ]
        )
        ProductCheckoutFieldAction.objects.bulk_create(
            [
                ProductCheckoutFieldAction(
                    group=group,
                    order=order,
                    is_active=True,
                    **action,
                )
                for order, action in enumerate(actions)
            ]
        )
        return group

    def seed_rule_groups(self, configuration):
        specs = [
            {
                "name": "Another user requires a selected target user",
                "priority": 100,
                "conditions": [
                    {
                        "source_key": "requesting_id",
                        "operator": "equals",
                        "comparison_value": "User",
                    }
                ],
                "actions": [
                    {
                        "target_key": "v_dar_objectid_reqfor",
                        "action_type": "require",
                    }
                ],
            },
            {
                "name": "Service account request requires service account",
                "priority": 110,
                "conditions": [
                    {
                        "source_key": "requesting_id",
                        "operator": "equals",
                        "comparison_value": "Service Account",
                    }
                ],
                "actions": [
                    {
                        "target_key": "v_dar_service_account",
                        "action_type": "require",
                    },
                    {
                        "target_key": "v_dar_accessType",
                        "action_type": "set_value",
                        "action_value": "Application",
                    },
                ],
            },
            {
                "name": "TDSP processing requires a pod",
                "priority": 120,
                "conditions": [
                    {
                        "source_key": "requesting_tdsp_processing",
                        "operator": "equals",
                        "comparison_value": "Yes",
                    }
                ],
                "actions": [
                    {
                        "target_key": "appropriateTDSPPod",
                        "action_type": "require",
                    }
                ],
            },
            {
                "name": "Sensitive classifications require PI and SPI selections",
                "priority": 200,
                "conditions": [
                    {
                        "source_key": "v_dar_accessReqClassification",
                        "operator": "in",
                        "comparison_value": SENSITIVE,
                    }
                ],
                "actions": [
                    {"target_key": "v_dar_pi", "action_type": "require"},
                    {"target_key": "v_dar_spi", "action_type": "require"},
                ],
            },
            {
                "name": "PI or SPI access requires the original PI protocol",
                "priority": 210,
                "evaluation_mode": "any",
                "conditions": [
                    {
                        "source_key": "v_dar_pi",
                        "operator": "equals",
                        "comparison_value": "Yes",
                    },
                    {
                        "source_key": "v_dar_spi",
                        "operator": "equals",
                        "comparison_value": "Yes",
                    },
                ],
                "actions": [
                    {
                        "target_key": "edm_PI_personal_details",
                        "action_type": "require",
                    },
                    {
                        "target_key": "v_edm_type_of_work",
                        "action_type": "require",
                    },
                    {
                        "target_key": "v_edm_3rd_party_vendor",
                        "action_type": "require",
                    },
                ],
            },
            {
                "name": "Personal details require a documented business use case",
                "priority": 220,
                "conditions": [
                    {
                        "source_key": "edm_PI_personal_details",
                        "operator": "equals",
                        "comparison_value": "Yes",
                    }
                ],
                "actions": [
                    {
                        "target_key": "v_emd_specify_PII_needs",
                        "action_type": "require",
                    }
                ],
            },
        ]

        active_names = []
        for spec in specs:
            active_names.append(spec["name"])
            self.upsert_group(configuration=configuration, **spec)

        configuration.rule_groups.exclude(name__in=active_names).update(is_active=False)

    def seed_validation_rules(self, configuration):
        specs = [
            (
                "v_dar_businessJustification",
                "required",
                None,
                "Intended Use is required.",
                100,
            ),
            (
                "v_dar_businessJustification",
                "min_length",
                6,
                "Intended Use must contain at least 6 characters.",
                101,
            ),
            (
                "v_dar_businessJustification",
                "max_length",
                200,
                "Intended Use cannot exceed 200 characters.",
                102,
            ),
            (
                "v_dar_DataReqDescription",
                "required",
                None,
                "Data Request Description is required.",
                110,
            ),
            (
                "v_emd_specify_PII_needs",
                "min_length",
                6,
                "Sensitive PI business use case must contain at least 6 characters.",
                120,
            ),
            (
                "v_emd_specify_PII_needs",
                "max_length",
                200,
                "Sensitive PI business use case cannot exceed 200 characters.",
                121,
            ),
            (
                "chk_dar_terms_message",
                "required_true",
                True,
                "You must agree to the Terms of Use.",
                900,
            ),
        ]

        active_keys = []
        for field_key, validation_type, value, message, order in specs:
            active_keys.append((field_key, validation_type))
            ProductCheckoutValidationRule.objects.update_or_create(
                configuration=configuration,
                field_key=field_key,
                validation_type=validation_type,
                defaults={
                    "validation_value": value,
                    "error_message": message,
                    "order": order,
                    "is_active": True,
                },
            )

        for rule in configuration.validation_rules.all():
            if (rule.field_key, rule.validation_type) not in active_keys:
                rule.is_active = False
                rule.save(update_fields=["is_active", "updated_at"])

    def seed_routing_rules(self, configuration):
        specs = [
            {
                "name": "TDSP pod route",
                "priority": 10,
                "conditions": [
                    {
                        "source_key": "requesting_tdsp_processing",
                        "operator": "equals",
                        "comparison_value": "Yes",
                    },
                    {
                        "source_key": "appropriateTDSPPod",
                        "operator": "is_not_empty",
                        "comparison_value": None,
                    },
                ],
                "route_identifier": "40",
                "ad_group_template": (
                    "For TDSP processing: {product.adgroup} | "
                    "Pod: {appropriateTDSPPod}"
                ),
                "stop_processing": True,
                "metadata": {},
            },
            {
                "name": "Service account route",
                "priority": 20,
                "conditions": [
                    {
                        "source_key": "requesting_id",
                        "operator": "equals",
                        "comparison_value": "Service Account",
                    }
                ],
                "route_identifier": "",
                "ad_group_template": (
                    "For Service Account provisioning: {product.adgroup} | "
                    "Service Account: {v_dar_service_account}"
                ),
                "stop_processing": True,
                "metadata": {},
            },
            {
                "name": "Default product route",
                "priority": 999,
                "conditions": [],
                "route_identifier": "",
                "ad_group_template": "",
                "stop_processing": True,
                "metadata": {"uses_product_defaults": True},
            },
        ]

        active_names = []
        for spec in specs:
            data = spec.copy()
            name = data.pop("name")
            active_names.append(name)
            ProductCheckoutRoutingRule.objects.update_or_create(
                configuration=configuration,
                name=name,
                defaults={**data, "is_active": True},
            )

        configuration.routing_rules.exclude(name__in=active_names).update(
            is_active=False
        )
