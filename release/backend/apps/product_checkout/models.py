import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class AuditModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="%(app_label)s_%(class)s_created")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="%(app_label)s_%(class)s_updated")
    class Meta:
        abstract = True


class FieldType(models.TextChoices):
    TEXT = "text", "Text"
    TEXTAREA = "textarea", "Textarea"
    EMAIL = "email", "Email"
    INTEGER = "integer", "Integer"
    DECIMAL = "decimal", "Decimal"
    DATE = "date", "Date"
    CHECKBOX = "checkbox", "Checkbox"
    SELECT = "select", "Select"
    MULTISELECT = "multiselect", "Multi-select"
    USER_LOOKUP = "user_lookup", "User lookup"


class CheckoutStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SUBMITTED = "submitted", "Submitted"
    PENDING_APPROVAL = "pending_approval", "Pending approval"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    FULFILLING = "fulfilling", "Fulfilling"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class RequestType(models.TextChoices):
    SELF = "self", "For me"
    OTHER_USER = "other_user", "For someone else"
    SERVICE_ACCOUNT = "service_account", "For a service account"


class ProductCheckoutConfiguration(AuditModel):
    product_ref = models.CharField(max_length=255, unique=True, db_index=True, help_text="String form of the product primary key.")
    product_model = models.CharField(max_length=255, blank=True, default="", help_text="Optional app_label.ModelName override.")
    is_active = models.BooleanField(default=True)
    allow_other_user = models.BooleanField(default=True)
    allow_service_account = models.BooleanField(default=False)
    requires_terms = models.BooleanField(default=True)
    requires_manager_approval = models.BooleanField(default=False)
    fulfillment_group = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = "product_checkout_configuration"
        verbose_name = "Configuration"
        verbose_name_plural = "Configurations"
        ordering = ("product_ref",)
    def __str__(self):
        return f"Checkout config for product {self.product_ref}"


class ProductQuestion(AuditModel):
    configuration = models.ForeignKey(ProductCheckoutConfiguration, on_delete=models.CASCADE, related_name="questions")
    key = models.CharField(max_length=150)
    label = models.CharField(max_length=500)
    field_type = models.CharField(max_length=30, choices=FieldType.choices, default=FieldType.TEXT)
    help_text = models.TextField(blank=True)
    placeholder = models.CharField(max_length=500, blank=True)
    required = models.BooleanField(default=False)
    default_value = models.JSONField(null=True, blank=True)
    min_length = models.PositiveIntegerField(null=True, blank=True)
    max_length = models.PositiveIntegerField(null=True, blank=True)
    regex_pattern = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = "product_checkout_question"
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ("order", "id")
        constraints = [models.UniqueConstraint(fields=("configuration", "key"), name="unique_checkout_question_key")]
    def clean(self):
        if self.max_length is not None and self.min_length is not None and self.max_length < self.min_length:
            raise ValidationError({"max_length": "Maximum length must be at least minimum length."})
    def __str__(self):
        return self.label


class ProductQuestionOption(AuditModel):
    question = models.ForeignKey(ProductQuestion, on_delete=models.CASCADE, related_name="options")
    label = models.CharField(max_length=500)
    value = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = "product_checkout_question_option"
        verbose_name = "Configuration"
        verbose_name_plural = "Configurations"
        ordering = ("order", "id")
        constraints = [models.UniqueConstraint(fields=("question", "value"), name="unique_checkout_question_option")]


class ProductCheckoutRule(AuditModel):
    class Operator(models.TextChoices):
        EQUALS = "equals", "Equals"
        NOT_EQUALS = "not_equals", "Does not equal"
        IN = "in", "Is one of"
        IS_EMPTY = "is_empty", "Is empty"
        IS_NOT_EMPTY = "is_not_empty", "Is not empty"
    class Action(models.TextChoices):
        SHOW = "show", "Show"
        HIDE = "hide", "Hide"
        REQUIRE = "require", "Require"
        OPTIONAL = "optional", "Optional"
        SET_VALUE = "set_value", "Set value"
        CLEAR_VALUE = "clear_value", "Clear value"
    configuration = models.ForeignKey(ProductCheckoutConfiguration, on_delete=models.CASCADE, related_name="rules")
    source_key = models.CharField(max_length=150, help_text="Question key or context key such as request_type/product.classification.")
    operator = models.CharField(max_length=30, choices=Operator.choices)
    comparison_value = models.JSONField(null=True, blank=True)
    target_key = models.CharField(max_length=150)
    action = models.CharField(max_length=30, choices=Action.choices)
    action_value = models.JSONField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = "product_checkout_rule"
        verbose_name = "Rule"
        verbose_name_plural = "Rules"
        ordering = ("order", "id")


class ProductCheckoutRequest(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_number = models.CharField(max_length=100, unique=True, editable=False)
    product_ref = models.CharField(max_length=255, db_index=True)
    product_model = models.CharField(max_length=255, blank=True, default="")
    product_snapshot = models.JSONField(default=dict)
    requestor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="product_checkout_requests")
    requestor_snapshot = models.JSONField(default=dict)
    request_type = models.CharField(max_length=30, choices=RequestType.choices)
    target_user_id = models.CharField(max_length=255, blank=True, default="")
    target_user_snapshot = models.JSONField(default=dict, blank=True)
    service_account = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=30, choices=CheckoutStatus.choices, default=CheckoutStatus.SUBMITTED, db_index=True)
    terms_accepted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = "product_checkout_request"
        verbose_name = "Request"
        verbose_name_plural = "Requests"
        ordering = ("-created_at",)
    def __str__(self):
        return self.request_number


class ProductCheckoutAnswer(AuditModel):
    request = models.ForeignKey(ProductCheckoutRequest, on_delete=models.CASCADE, related_name="answers")
    question_key = models.CharField(max_length=150)
    question_label = models.CharField(max_length=500)
    value = models.JSONField(null=True, blank=True)
    class Meta:
        db_table = "product_checkout_answer"
        ordering = ("id",)
        constraints = [models.UniqueConstraint(fields=("request", "question_key"), name="unique_checkout_answer")]


class ProductApproval(AuditModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
    request = models.ForeignKey(ProductCheckoutRequest, on_delete=models.CASCADE, related_name="approvals")
    sequence = models.PositiveIntegerField(default=1)
    approver_user_id = models.CharField(max_length=255, blank=True, default="")
    approver_name = models.CharField(max_length=500, blank=True, default="")
    approver_email = models.EmailField(blank=True, default="")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    comments = models.TextField(blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "product_checkout_approval"
        verbose_name = "Approval"
        verbose_name_plural = "Approvals"
        ordering = ("sequence", "id")


class ProductFulfillment(AuditModel):
    request = models.OneToOneField(ProductCheckoutRequest, on_delete=models.CASCADE, related_name="fulfillment")
    fulfillment_group = models.CharField(max_length=255, blank=True, default="")
    external_request_id = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=30, default="pending")
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "product_checkout_fulfillment"
        verbose_name = "Fulfillment"
        verbose_name_plural = "Fulfillments"


class RuleEvaluationMode(models.TextChoices):
    ALL = "all", "All conditions"
    ANY = "any", "Any condition"


class CheckoutRuleOperator(models.TextChoices):
    EQUALS = "equals", "Equals"
    NOT_EQUALS = "not_equals", "Does not equal"
    IN = "in", "Is one of"
    NOT_IN = "not_in", "Is not one of"
    IS_EMPTY = "is_empty", "Is empty"
    IS_NOT_EMPTY = "is_not_empty", "Is not empty"
    CONTAINS = "contains", "Contains"


class CheckoutFieldActionType(models.TextChoices):
    SHOW = "show", "Show"
    HIDE = "hide", "Hide"
    REQUIRE = "require", "Require"
    OPTIONAL = "optional", "Optional"
    ENABLE = "enable", "Enable"
    DISABLE = "disable", "Disable"
    SET_VALUE = "set_value", "Set value"
    CLEAR_VALUE = "clear_value", "Clear value"


class CheckoutValidationType(models.TextChoices):
    REQUIRED = "required", "Required"
    REQUIRED_TRUE = "required_true", "Must be accepted"
    MIN_LENGTH = "min_length", "Minimum length"
    MAX_LENGTH = "max_length", "Maximum length"
    REGEX = "regex", "Regular expression"
    EMAIL = "email", "Email"
    NUMBER = "number", "Number"
    ONE_OF = "one_of", "Allowed values"


class ProductCheckoutRuleGroup(AuditModel):
    configuration = models.ForeignKey(
        ProductCheckoutConfiguration,
        on_delete=models.CASCADE,
        related_name="rule_groups",
    )
    name = models.CharField(max_length=255)
    evaluation_mode = models.CharField(
        max_length=10,
        choices=RuleEvaluationMode.choices,
        default=RuleEvaluationMode.ALL,
    )
    priority = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "product_checkout_rule_group"
        verbose_name = "Rule Group"
        verbose_name_plural = "Rule Groups"
        ordering = ("priority", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("configuration", "name"),
                name="unique_checkout_rule_group",
            )
        ]

    def __str__(self):
        return self.name


class ProductCheckoutCondition(AuditModel):
    group = models.ForeignKey(
        ProductCheckoutRuleGroup,
        on_delete=models.CASCADE,
        related_name="conditions",
    )
    source_key = models.CharField(
        max_length=150,
        help_text=(
            "Form key, request_type, or product context key such as "
            "product.classification."
        ),
    )
    operator = models.CharField(
        max_length=30,
        choices=CheckoutRuleOperator.choices,
    )
    comparison_value = models.JSONField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_checkout_condition"
        ordering = ("order", "id")


class ProductCheckoutFieldAction(AuditModel):
    group = models.ForeignKey(
        ProductCheckoutRuleGroup,
        on_delete=models.CASCADE,
        related_name="actions",
    )
    target_key = models.CharField(max_length=150)
    action_type = models.CharField(
        max_length=30,
        choices=CheckoutFieldActionType.choices,
    )
    action_value = models.JSONField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_checkout_field_action"
        verbose_name = "Field Action"
        verbose_name_plural = "Field Actions"
        ordering = ("order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("group", "target_key", "action_type", "order"),
                name="unique_checkout_field_action",
            )
        ]


class ProductCheckoutValidationRule(AuditModel):
    configuration = models.ForeignKey(
        ProductCheckoutConfiguration,
        on_delete=models.CASCADE,
        related_name="validation_rules",
    )
    field_key = models.CharField(max_length=150)
    validation_type = models.CharField(
        max_length=30,
        choices=CheckoutValidationType.choices,
    )
    validation_value = models.JSONField(null=True, blank=True)
    error_message = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_checkout_validation_rule"
        verbose_name = "Validation Rule"
        verbose_name_plural = "Validation Rules"
        ordering = ("order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("configuration", "field_key", "validation_type"),
                name="unique_checkout_validation_rule",
            )
        ]


class ProductCheckoutRoutingRule(AuditModel):
    configuration = models.ForeignKey(
        ProductCheckoutConfiguration,
        on_delete=models.CASCADE,
        related_name="routing_rules",
    )
    name = models.CharField(max_length=255)
    priority = models.PositiveIntegerField(default=100)
    conditions = models.JSONField(
        default=list,
        blank=True,
        help_text=(
            "List of {source_key, operator, comparison_value} objects. "
            "Every condition must match."
        ),
    )
    route_identifier = models.CharField(max_length=100, blank=True, default="")
    fulfillment_group = models.CharField(max_length=255, blank=True, default="")
    control_group = models.CharField(max_length=255, blank=True, default="")
    organization = models.CharField(max_length=255, blank=True, default="")
    ad_group_template = models.CharField(
        max_length=1000,
        blank=True,
        default="",
        help_text=(
            "Optional format string using context keys, for example "
            "For TDSP processing: {product.adgroup} | Pod: "
            "{appropriateTDSPPod}."
        ),
    )
    stop_processing = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "product_checkout_routing_rule"
        verbose_name = "Routing Rule"
        verbose_name_plural = "Routing Rules"
        ordering = ("priority", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("configuration", "name"),
                name="unique_checkout_routing_rule",
            )
        ]

    def __str__(self):
        return self.name
