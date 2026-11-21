from django.conf import settings
from django.db import models
from pgvector.django import HnswIndex, VectorField

class Document(models.Model):
    class IntelligenceStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETE = "complete", "Complete"
        FAILED = "failed", "Failed"
        DISABLED = "disabled", "Disabled"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="knowledge_documents")
    shared = models.BooleanField(default=False, help_text="Staff learning files are available to every signed-in user.")
    title = models.CharField(max_length=255)
    source_file = models.FileField(upload_to="documents/%Y/%m/")
    content_hash = models.CharField(max_length=64, db_index=True, blank=True)
    executive_summary = models.TextField(blank=True)
    key_topics = models.JSONField(default=list, blank=True)
    key_risks = models.JSONField(default=list, blank=True)
    key_actions = models.JSONField(default=list, blank=True)
    suggested_questions = models.JSONField(default=list, blank=True)
    intelligence_status = models.CharField(max_length=20, choices=IntelligenceStatus.choices, default=IntelligenceStatus.PENDING)
    intelligence_error = models.TextField(blank=True)
    intelligence_updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["owner", "content_hash"], name="unique_owner_document_content")]

    def __str__(self):
        return self.title

class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, related_name="chunks", on_delete=models.CASCADE)
    position = models.PositiveIntegerField()
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    embedding_provider = models.CharField(max_length=50)
    embedding_model = models.CharField(max_length=100)
    embedding_version = models.PositiveIntegerField(default=1)
    embedding = VectorField(
        dimensions=384,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["document_id", "position"]
        constraints = [models.UniqueConstraint(fields=["document", "position"], name="unique_document_chunk_position")]
        indexes = [HnswIndex(name="chunk_embedding_hnsw", fields=["embedding"], m=16, ef_construction=64, opclasses=["vector_cosine_ops"])]

class Entity(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="knowledge_entities")
    entity_type = models.CharField(max_length=40, db_index=True)
    canonical_name = models.CharField(max_length=255)
    normalized_name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["entity_type", "canonical_name"]
        constraints = [models.UniqueConstraint(fields=["owner", "entity_type", "normalized_name"], name="unique_owner_entity")]

    def __str__(self):
        return f"{self.canonical_name} ({self.entity_type})"

class DocumentEntity(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="entity_links")
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="document_links")
    mentions = models.PositiveIntegerField(default=1)
    evidence = models.JSONField(default=list, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["document", "entity"], name="unique_document_entity")]

class EntityRelation(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="knowledge_relations")
    subject = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="outgoing_relations")
    predicate = models.CharField(max_length=100, db_index=True)
    object = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="incoming_relations")
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="entity_relations")
    evidence = models.TextField(blank=True)
    confidence = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["subject__canonical_name", "predicate", "object__canonical_name"]
        constraints = [
            models.UniqueConstraint(fields=["document", "subject", "predicate", "object"], name="unique_document_entity_relation"),
            models.CheckConstraint(check=~models.Q(subject=models.F("object")), name="relation_subject_not_object"),
        ]

class TimelineEvent(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="timeline_events")
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="timeline_events")
    event_date = models.DateField(null=True, blank=True, db_index=True)
    date_text = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_type = models.CharField(max_length=80, blank=True, db_index=True)
    entities = models.ManyToManyField(Entity, blank=True, related_name="timeline_events")
    evidence = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = [models.F("event_date").asc(nulls_last=True), "position", "id"]
        constraints = [models.UniqueConstraint(fields=["document", "position", "title"], name="unique_document_timeline_event")]

class MarketplaceDomain(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_domains")
    external_id = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    class Meta:
        ordering = ["name"]
        constraints = [models.UniqueConstraint(fields=["owner", "name"], name="unique_owner_marketplace_domain")]
    def __str__(self): return self.name

class MarketplaceDataType(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_data_types")
    external_id = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=255)
    value = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)
    class Meta:
        ordering = ["name"]
        constraints = [models.UniqueConstraint(fields=["owner", "name"], name="unique_owner_marketplace_data_type")]
    def __str__(self): return self.name

class MarketplaceTeam(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_teams")
    external_id = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=255)
    route_id = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)
    class Meta:
        ordering = ["name"]
        constraints = [models.UniqueConstraint(fields=["owner", "name"], name="unique_owner_marketplace_team")]
    def __str__(self): return self.name

class MarketplaceProduct(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        ARCHIVED = "archived", "Archived"
        DISCONTINUED = "discontinued", "Discontinued"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_products")
    external_id = models.CharField(max_length=100, blank=True, db_index=True)
    sku = models.CharField(max_length=100, blank=True, db_index=True)
    name = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, blank=True)
    brief_description = models.TextField(blank=True)
    short_description = models.TextField(blank=True)
    intended_use = models.TextField(blank=True)
    resource_url = models.URLField(max_length=1000, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.DRAFT, db_index=True)
    active = models.BooleanField(default=True)
    contains_pi = models.BooleanField(default=False)
    contains_sensitive_pi = models.BooleanField(default=False)
    data_review_required = models.BooleanField(default=False)
    access_type = models.CharField(max_length=150, blank=True)
    environment = models.CharField(max_length=150, blank=True)
    availability = models.CharField(max_length=150, blank=True)
    frequency = models.CharField(max_length=150, blank=True)
    domain = models.ForeignKey(MarketplaceDomain, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    data_type = models.ForeignKey(MarketplaceDataType, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    fulfillment_team = models.ForeignKey(MarketplaceTeam, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    steward_name = models.CharField(max_length=255, blank=True)
    business_contact = models.CharField(max_length=255, blank=True)
    ai_summary = models.TextField(blank=True)
    ai_use_cases = models.JSONField(default=list, blank=True)
    ai_audiences = models.JSONField(default=list, blank=True)
    ai_keywords = models.JSONField(default=list, blank=True)
    intelligence_status = models.CharField(max_length=20, default="pending", db_index=True)
    intelligence_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(condition=~models.Q(external_id=""), fields=["owner", "external_id"], name="unique_owner_marketplace_external_id"),
            models.UniqueConstraint(fields=["owner", "name"], name="unique_owner_marketplace_product_name"),
        ]
        indexes = [models.Index(fields=["owner", "status", "active"], name="market_product_scope_idx")]
    def __str__(self): return self.name

class MarketplaceProductSimilarity(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_similarities")
    source = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="similar_products")
    target = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="similar_to_products")
    score = models.FloatField(default=0.0)
    rationale = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-score"]
        constraints = [
            models.UniqueConstraint(fields=["source", "target"], name="unique_marketplace_product_similarity"),
            models.CheckConstraint(check=~models.Q(source=models.F("target")), name="market_similarity_not_self"),
        ]

class GovernanceSteward(models.Model):
    class Role(models.TextChoices):
        DATA_STEWARD = "data_steward", "Data Steward"
        BUSINESS_OWNER = "business_owner", "Business Owner"
        TECHNICAL_OWNER = "technical_owner", "Technical Owner"
        APPROVER = "approver", "Approver"
        FULFILLMENT = "fulfillment", "Fulfillment Contact"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="governance_stewards")
    external_id = models.CharField(max_length=120, blank=True)
    display_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    role = models.CharField(max_length=40, choices=Role.choices)
    domain = models.ForeignKey(MarketplaceDomain, null=True, blank=True, on_delete=models.SET_NULL, related_name="stewards")
    team = models.ForeignKey(MarketplaceTeam, null=True, blank=True, on_delete=models.SET_NULL, related_name="stewards")
    active = models.BooleanField(default=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["display_name", "role"]
        constraints = [models.UniqueConstraint(fields=["owner", "display_name", "role", "domain"], name="unique_governance_steward_assignment")]
    def __str__(self): return f"{self.display_name} ({self.get_role_display()})"

class GovernancePolicy(models.Model):
    class Severity(models.TextChoices):
        INFORMATIONAL = "informational", "Informational"
        REQUIRED = "required", "Required"
        RESTRICTED = "restricted", "Restricted"
        PROHIBITED = "prohibited", "Prohibited"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="governance_policies")
    external_id = models.CharField(max_length=120, blank=True)
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=50, blank=True)
    description = models.TextField()
    severity = models.CharField(max_length=30, choices=Severity.choices, default=Severity.REQUIRED)
    authoritative = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    effective_date = models.DateField(null=True, blank=True)
    review_date = models.DateField(null=True, blank=True)
    source_url = models.URLField(max_length=1000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["name", "version"]
        constraints = [models.UniqueConstraint(fields=["owner", "name", "version"], name="unique_governance_policy_version")]
    def __str__(self): return f"{self.name} {self.version}".strip()

class GovernanceRule(models.Model):
    class Condition(models.TextChoices):
        ALWAYS = "always", "Always"
        CONTAINS_PI = "contains_pi", "Contains PI"
        CONTAINS_SENSITIVE_PI = "contains_sensitive_pi", "Contains Sensitive PI"
        DATA_REVIEW_REQUIRED = "data_review_required", "Data Review Required"
        STATUS = "status", "Lifecycle Status"
        DOMAIN = "domain", "Domain"
        DATA_TYPE = "data_type", "Data Type"
        ACCESS_TYPE = "access_type", "Access Type"
        ENVIRONMENT = "environment", "Environment"
    class Requirement(models.TextChoices):
        NOTICE = "notice", "Notice"
        TRAINING = "training", "Training"
        APPROVAL = "approval", "Approval"
        JUSTIFICATION = "justification", "Business Justification"
        DATA_REVIEW = "data_review", "Data Review"
        SECURITY_REVIEW = "security_review", "Security Review"
        RESTRICT = "restrict", "Restrict Access"
        PROHIBIT = "prohibit", "Prohibit Access"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="governance_rules")
    policy = models.ForeignKey(GovernancePolicy, on_delete=models.CASCADE, related_name="rules")
    name = models.CharField(max_length=255)
    condition_type = models.CharField(max_length=40, choices=Condition.choices)
    condition_value = models.CharField(max_length=500, blank=True)
    requirement_type = models.CharField(max_length=40, choices=Requirement.choices)
    requirement_value = models.CharField(max_length=500, blank=True)
    message = models.TextField()
    priority = models.PositiveIntegerField(default=100)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["priority", "name"]
        constraints = [models.UniqueConstraint(fields=["policy", "name"], name="unique_policy_rule_name")]
    def __str__(self): return self.name

class ProductGovernanceAssignment(models.Model):
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="governance_assignments")
    policy = models.ForeignKey(GovernancePolicy, on_delete=models.CASCADE, related_name="product_assignments")
    assigned_by_rule = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["product", "policy"], name="unique_product_governance_policy")]

class ProductStewardAssignment(models.Model):
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="steward_assignments")
    steward = models.ForeignKey(GovernanceSteward, on_delete=models.CASCADE, related_name="product_assignments")
    primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["product", "steward"], name="unique_product_steward")]

class GovernanceAssessment(models.Model):
    class Status(models.TextChoices):
        CLEAR = "clear", "Clear"
        ACTION_REQUIRED = "action_required", "Action Required"
        RESTRICTED = "restricted", "Restricted"
        PROHIBITED = "prohibited", "Prohibited"
        UNKNOWN = "unknown", "Unknown"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="governance_assessments")
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="governance_assessments")
    status = models.CharField(max_length=30, choices=Status.choices)
    matched_rules = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    missing_authoritative_data = models.JSONField(default=list, blank=True)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]

class AccessRequirement(models.Model):
    class Kind(models.TextChoices):
        JUSTIFICATION = "justification", "Business Justification"
        TRAINING = "training", "Training"
        APPROVAL = "approval", "Approval"
        ATTESTATION = "attestation", "Attestation"
        DATA_REVIEW = "data_review", "Data Review"
        SECURITY_REVIEW = "security_review", "Security Review"
        ROLE = "role", "Required Role"
        DOCUMENT = "document", "Supporting Document"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="access_requirements")
    product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.CASCADE, related_name="access_requirements")
    domain = models.ForeignKey(MarketplaceDomain, null=True, blank=True, on_delete=models.CASCADE, related_name="access_requirements")
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=40, choices=Kind.choices)
    value = models.CharField(max_length=500, blank=True)
    instructions = models.TextField(blank=True)
    required = models.BooleanField(default=True)
    authoritative = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["priority", "name"]
        constraints = [models.UniqueConstraint(fields=["owner", "product", "domain", "name"], name="unique_access_requirement_scope")]
    def __str__(self): return self.name

class ApprovalRoute(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="approval_routes")
    product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.CASCADE, related_name="approval_routes")
    domain = models.ForeignKey(MarketplaceDomain, null=True, blank=True, on_delete=models.CASCADE, related_name="approval_routes")
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["priority", "name"]
        constraints = [models.UniqueConstraint(fields=["owner", "product", "domain", "name"], name="unique_approval_route_scope")]
    def __str__(self): return self.name

class ApprovalRouteStep(models.Model):
    class ApproverType(models.TextChoices):
        STEWARD_ROLE = "steward_role", "Steward Role"
        NAMED_STEWARD = "named_steward", "Named Steward"
        TEAM = "team", "Team"
        EXTERNAL = "external", "External Process"
    route = models.ForeignKey(ApprovalRoute, on_delete=models.CASCADE, related_name="steps")
    position = models.PositiveIntegerField()
    approver_type = models.CharField(max_length=40, choices=ApproverType.choices)
    steward_role = models.CharField(max_length=40, blank=True)
    steward = models.ForeignKey(GovernanceSteward, null=True, blank=True, on_delete=models.SET_NULL, related_name="approval_steps")
    team = models.ForeignKey(MarketplaceTeam, null=True, blank=True, on_delete=models.SET_NULL, related_name="approval_steps")
    external_label = models.CharField(max_length=255, blank=True)
    required = models.BooleanField(default=True)
    instructions = models.TextField(blank=True)
    class Meta:
        ordering = ["position"]
        constraints = [models.UniqueConstraint(fields=["route", "position"], name="unique_approval_route_position")]

class AccessProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="access_profile")
    organization = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    job_role = models.CharField(max_length=255, blank=True)
    completed_trainings = models.JSONField(default=list, blank=True)
    accepted_attestations = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class AccessCart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="access_cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class AccessCartItem(models.Model):
    cart = models.ForeignKey(AccessCart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="cart_items")
    business_justification = models.TextField(blank=True)
    intended_use = models.TextField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "product"], name="unique_access_cart_product")]

class AccessRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        READY = "ready", "Ready"
        SUBMITTED = "submitted", "Submitted"
        IN_REVIEW = "in_review", "In Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELED = "canceled", "Canceled"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="access_requests")
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="access_requests")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.DRAFT)
    business_justification = models.TextField(blank=True)
    intended_use = models.TextField(blank=True)
    readiness_snapshot = models.JSONField(default=dict, blank=True)
    governance_snapshot = models.JSONField(default=dict, blank=True)
    route_snapshot = models.JSONField(default=list, blank=True)
    external_request_id = models.CharField(max_length=255, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-created_at"]

class AccessRequestApproval(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        SKIPPED = "skipped", "Skipped"
    request = models.ForeignKey(AccessRequest, on_delete=models.CASCADE, related_name="approvals")
    position = models.PositiveIntegerField()
    approver_label = models.CharField(max_length=255)
    approver_email = models.EmailField(blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    decision_notes = models.TextField(blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["position"]
        constraints = [models.UniqueConstraint(fields=["request", "position"], name="unique_access_request_approval_position")]

class MarketplaceFavorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_favorites")
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_marketplace_favorite")]

class MarketplaceActivity(models.Model):
    class Kind(models.TextChoices):
        VIEW = "view", "Product View"
        SEARCH = "search", "Search"
        RECOMMEND = "recommend", "Recommendation"
        FAVORITE = "favorite", "Favorite"
        CART = "cart", "Cart"
        ACCESS_CHECK = "access_check", "Access Check"
        GOVERNANCE_CHECK = "governance_check", "Governance Check"
        VIKKI = "vikki", "VIKKI Interaction"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_activities")
    kind = models.CharField(max_length=40, choices=Kind.choices, db_index=True)
    product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.CASCADE, related_name="activities")
    query = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "kind", "created_at"], name="market_activity_idx")]

class VikkiSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vikki_sessions")
    conversation = models.OneToOneField("chat.Conversation", null=True, blank=True, on_delete=models.SET_NULL, related_name="vikki_session")
    current_product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.SET_NULL, related_name="vikki_sessions")
    page_context = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class VikkiSuggestion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vikki_suggestions")
    product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.CASCADE, related_name="vikki_suggestions")
    title = models.CharField(max_length=255)
    prompt = models.TextField()
    reason = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["-created_at"]

class MarketplaceSearchEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_search_events")
    query = models.TextField()
    normalized_query = models.TextField(db_index=True)
    result_count = models.PositiveIntegerField(default=0)
    recommendation = models.BooleanField(default=False)
    filters = models.JSONField(default=dict, blank=True)
    selected_product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.SET_NULL, related_name="search_selections")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"], name="market_search_user_dt_idx"),
            models.Index(fields=["user", "result_count"], name="market_search_gap_idx"),
        ]

class MarketplaceDailyMetric(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_daily_metrics")
    metric_date = models.DateField(db_index=True)
    metric_name = models.CharField(max_length=80)
    dimension_type = models.CharField(max_length=80, blank=True)
    dimension_value = models.CharField(max_length=255, blank=True)
    value = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["metric_date", "metric_name", "dimension_value"]
        constraints = [models.UniqueConstraint(fields=["owner", "metric_date", "metric_name", "dimension_type", "dimension_value"], name="unique_marketplace_daily_metric")]
        indexes = [models.Index(fields=["owner", "metric_name", "metric_date"], name="market_daily_metric_idx")]

class MarketplaceAnalyticsSnapshot(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_analytics_snapshots")
    period_start = models.DateField()
    period_end = models.DateField()
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]

class LineageAsset(models.Model):
    class Kind(models.TextChoices):
        PRODUCT = "product", "Marketplace Product"
        DATASET = "dataset", "Dataset"
        TABLE = "table", "Table"
        VIEW = "view", "View"
        COLUMN = "column", "Column"
        API = "api", "API"
        DASHBOARD = "dashboard", "Dashboard"
        REPORT = "report", "Report"
        MODEL = "model", "Model"
        PIPELINE = "pipeline", "Pipeline"
        APPLICATION = "application", "Application"
        BUSINESS_PROCESS = "business_process", "Business Process"
        TEAM = "team", "Team"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lineage_assets")
    external_id = models.CharField(max_length=255)
    name = models.CharField(max_length=500)
    kind = models.CharField(max_length=40, choices=Kind.choices, db_index=True)
    description = models.TextField(blank=True)
    system_name = models.CharField(max_length=255, blank=True, db_index=True)
    environment = models.CharField(max_length=100, blank=True)
    qualified_name = models.CharField(max_length=1000, blank=True)
    product = models.OneToOneField(MarketplaceProduct, null=True, blank=True, on_delete=models.SET_NULL, related_name="lineage_asset")
    steward_name = models.CharField(max_length=255, blank=True)
    authoritative = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["kind", "name"]
        constraints = [models.UniqueConstraint(fields=["owner", "external_id"], name="unique_lineage_asset_external_id")]
        indexes = [models.Index(fields=["owner", "kind", "active"], name="lineage_asset_scope_idx")]
    def __str__(self): return f"{self.name} ({self.kind})"

class LineageEdge(models.Model):
    class Relation(models.TextChoices):
        PRODUCES = "produces", "Produces"
        CONSUMES = "consumes", "Consumes"
        DERIVES_FROM = "derives_from", "Derives From"
        TRANSFORMS_TO = "transforms_to", "Transforms To"
        FEEDS = "feeds", "Feeds"
        EXPOSES = "exposes", "Exposes"
        VISUALIZES = "visualizes", "Visualizes"
        DEPENDS_ON = "depends_on", "Depends On"
        IMPLEMENTS = "implements", "Implements"
        OWNED_BY = "owned_by", "Owned By"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lineage_edges")
    upstream = models.ForeignKey(LineageAsset, on_delete=models.CASCADE, related_name="outgoing_lineage")
    downstream = models.ForeignKey(LineageAsset, on_delete=models.CASCADE, related_name="incoming_lineage")
    relation = models.CharField(max_length=50, choices=Relation.choices, db_index=True)
    authoritative = models.BooleanField(default=True)
    confidence = models.FloatField(default=1.0)
    source_system = models.CharField(max_length=255, blank=True)
    source_reference = models.CharField(max_length=1000, blank=True)
    evidence = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["upstream__name", "downstream__name"]
        constraints = [
            models.UniqueConstraint(fields=["upstream", "downstream", "relation"], name="unique_lineage_edge"),
            models.CheckConstraint(check=~models.Q(upstream=models.F("downstream")), name="lineage_edge_not_self"),
        ]
        indexes = [models.Index(fields=["owner", "relation", "active"], name="lineage_edge_scope_idx")]

class LineageChangeScenario(models.Model):
    class ChangeType(models.TextChoices):
        SCHEMA = "schema", "Schema Change"
        DEPRECATION = "deprecation", "Deprecation"
        OUTAGE = "outage", "Outage"
        ACCESS = "access", "Access Change"
        QUALITY = "quality", "Data Quality Change"
        ENDPOINT = "endpoint", "Endpoint Change"
        SCHEDULE = "schedule", "Schedule Change"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lineage_change_scenarios")
    asset = models.ForeignKey(LineageAsset, on_delete=models.CASCADE, related_name="change_scenarios")
    change_type = models.CharField(max_length=40, choices=ChangeType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]

class LineageNotificationTarget(models.Model):
    asset = models.ForeignKey(LineageAsset, on_delete=models.CASCADE, related_name="notification_targets")
    label = models.CharField(max_length=255)
    contact_type = models.CharField(max_length=50, default="team")
    email = models.EmailField(blank=True)
    active = models.BooleanField(default=True)
    authoritative = models.BooleanField(default=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["asset", "label", "contact_type"], name="unique_lineage_notification_target")]

class VikkiFeedback(models.Model):
    class Rating(models.TextChoices):
        POSITIVE = "positive", "Positive"
        NEGATIVE = "negative", "Negative"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vikki_feedback")
    session_id = models.CharField(max_length=255, blank=True)
    rating = models.CharField(max_length=20, choices=Rating.choices)
    query = models.TextField(blank=True)
    answer = models.TextField(blank=True)
    correction = models.TextField(blank=True)
    product = models.ForeignKey(MarketplaceProduct, null=True, blank=True, on_delete=models.SET_NULL, related_name="vikki_feedback")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at"]
