import os
from allauth.utils import settings
from django.urls.base import reverse
from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django_ckeditor_5.fields import CKEditor5Field
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.utils import timezone # Added for timezone.now() in save method
from .marketplace_upload import (domain_upload_path, subdomain_upload_path, product_image_upload_path,
    validate_image_extension,
)
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from pgvector.django import VectorField, HnswIndex  # Added HnswIndex import
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import F, Q

ATTRIBUTE_TYPE = (
    ("Core Attributes", "Core Attributes"),
    ("Access & Licensing", "Access & Licensing"),
    ("Quality & Reliability", "Quality & Reliability"),
    ("Semantic & Contextual", "Semantic & Contextual"),
    ("Technical Metadata", "Technical Metadata"),
    ("Governance & Compliance", "Governance & Compliance"),
    ("User Experience", "User Experience"),
)

PI = (
    ("Yes", "Yes"),
    ("No", "No"),
)

SENSITIVE_PI = (
    ("Yes", "Yes"),
    ("No", "No"),
)

SORT_CHOICES = sorted({
    ("A", "A"),
    ("B", "B"),
    ("C", "C"),
    ("D", "D"),
    ("E", "E"),
    ("F", "F"),
    ("G", "G"),
    ("H", "H"),
    ("I", "I"),
    ("J", "J"),
}, key=lambda x: x[1])

DATA_REVIEW_BOARD_STATUS_CHOICES = [
    ("pending", "Pending Review"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
    ("change_requested", "Change Requested"),
    ("not_required", "Not Required"),
]

REVIEW_STATUS_CHOICES = (
    ('pending', 'Pending Approval'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)

CONTENT_STATUS_CHOICES = [
    ('draft','Draft'),
    ('approved','Approved'),
    ('denied','Denied'),
    ('request_edit','Request Edit'),
    ('cwpg_approved','CWPG Approved'),
]

PRODUCT_STATUS_CHOICES = [
    ('draft','Draft'),
    ('approved','Approved'),
    ('pending','Pending'),
    ('archived','Archived'),
    ('discontinued','Discontinued'),
]

# DOMAINS
class Domain(models.Model):
    sku = models.PositiveIntegerField(unique=True, editable=False)
    image = models.ImageField(upload_to=domain_upload_path, validators=[validate_image_extension], max_length=150, default='default.jpg', blank=True, null=True)
    name = models.CharField(max_length=150)
    description = CKEditor5Field('Domain Description', config_name='extends', blank=True, null=True)
    level = models.IntegerField(default=0)
    slug = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='domain_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='domain_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']
        verbose_name = "@Domain"

    def save(self, *args, **kwargs):
        if not self.sku:
            # This line might cause an error if Product is not yet defined or imported correctly
            # Assuming Product is defined later in this file or imported.
            last_sku = Product.objects.aggregate(models.Max('sku'))['sku__max']
            self.sku = (last_sku + 5) if last_sku is not None else 100
        super().save(*args, **kwargs)


# SUBDOMAINS LEVEL 2
class SubDomain_1(models.Model):
    sku = models.PositiveIntegerField(unique=True, editable=False)
    image = models.ImageField(upload_to=subdomain_upload_path, validators=[validate_image_extension], max_length=150, default='default.jpg', blank=True, null=True)
    name = models.CharField(max_length=150)
    description = CKEditor5Field('Subdomain Description', config_name='extends', blank=True, null=True)
    slug = models.CharField(max_length=150, blank=True, null=True)
    level = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='subdomain_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='subdomain_author_update')
    updated_at = models.DateField(auto_now=True)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='domain', null=False)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']
        verbose_name = "@Subdomain Level 2"
        verbose_name_plural = "@Subdomains Level 2"

    def save(self, *args, **kwargs):
        if not self.sku:
            # This line might cause an error if Product is not yet defined or imported correctly
            last_sku = Product.objects.aggregate(models.Max('sku'))['sku__max']
            self.sku = (last_sku + 2) if last_sku is not None else 100
        super().save(*args, **kwargs)


# SUBDOMAINS LEVEL 3
class SubDomain_2(models.Model):
    sku = models.IntegerField(unique=True)
    image = models.ImageField(upload_to=subdomain_upload_path, validators=[validate_image_extension], max_length=150, default='default.jpg', blank=True, null=True)
    name = models.CharField(max_length=150)
    description = CKEditor5Field('Subdomain Description', config_name='extends', blank=True, null=True)
    slug = models.CharField(max_length=150, blank=True, null=True)
    level = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='subdomains2_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='subdomains2_author_update')
    updated_at = models.DateField(auto_now=True)
    subdomain_1 = models.ForeignKey(SubDomain_1, on_delete=models.CASCADE, related_name='subdomain_1', null=False)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']
        verbose_name = "@Subdomain Level 3"
        verbose_name_plural = "@Subdomains Level 3"

    def save(self, *args, **kwargs):
        if not self.sku:
            # This line might cause an error if Product is not yet defined or imported correctly
            last_sku = Product.objects.aggregate(models.Max('sku'))['sku__max']
            self.sku = (last_sku + 3) if last_sku is not None else 100
        super().save(*args, **kwargs)


class Datatype(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    value = models.CharField('Value', max_length=50, null=True)
    slug = models.SlugField(max_length=100, blank=True, null=True, db_index=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='datatype_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='datatype_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']


class Classification(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    value = models.CharField('Value', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='classification_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='classification_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']


class Contact(models.Model):
    avatar = models.ImageField('Avatar', upload_to='marketplace/contacts/avatar/', validators=[validate_image_extension], max_length=2000, blank=True, null=True)
    name = models.CharField('Name', max_length=50, null=True)
    email = models.EmailField('Contact Email', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='contact_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='contact_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']


class Catalog(models.Model):
    image = models.FileField('Resource Logo', upload_to='marketplace/catalog/logos',
                             validators=[validate_image_extension], max_length=150, blank=True, null=True)
    name = models.CharField('Catalog Type', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='catalog_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='catalog_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']

class Badge(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='badge_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='badge_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']

class Platform(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    image = models.FileField('Platform Image', upload_to='marketplace/platforms/', validators=[validate_image_extension], max_length=2000, blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='platform_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='platform_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('max', 'created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']

class Organization(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    abbrev = models.CharField('Abbreviation', max_length=50, null=True)
    slug = models.SlugField(max_length=100, blank=True, null=True, db_index=True)
    image = models.FileField('Organization Image', upload_to='marketplace/organizations/', validators=[validate_image_extension], max_length=2000, blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='org_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='org_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        # Ensure abbrev is handled for string conversion
        return f"{self.name or 'Unnamed Organization'} | {self.abbrev or 'No Abbrev'}"

    class Meta:
        ordering = ['id']

class Company(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    abbrev = models.CharField('Abbreviations', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='company_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='company_author_update')
    updated_at = models.DateField(auto_now=True)
    org = models.ForeignKey(Organization, related_name='org_id', on_delete=models.CASCADE, blank=True, null=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']
        verbose_name = "Companie"

class DataSteward(models.Model):
    avatar = models.ImageField('Avatar', upload_to='marketplace/data-steward/avatar/', validators=[validate_image_extension], max_length=2000, blank=True, null=True)
    name = models.CharField('Name', max_length=50, null=True)
    email = models.EmailField('Data Steward  Email', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='steward_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='steward_author_update')
    updated_at = models.DateField(auto_now=True)
    company_id = models.ForeignKey(Company, related_name='company_id', on_delete=models.CASCADE, blank=True, null=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        # Ensure email and company_id are handled for string conversion
        company_name = self.company_id.name if self.company_id else "No Company"
        return f"{self.name or 'Unnamed Steward'}: {self.email or 'No Email'} | {company_name}"

    class Meta:
        ordering = ['id']
        verbose_name = "Data Steward"


class Keyword(models.Model):
    name = models.CharField('Name', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='keyword_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='keyword_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']


class AttributeType(models.Model):
    name = models.CharField('Attribute Type', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='attirbute_type_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='attirbute_type_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    class Meta:
        ordering = ['id']
        verbose_name = "Attribute Type"

    def __str__(self):
        return f"{self.name or 'Unnamed Attribute Type'} | {self.is_active}"


class Attribute(models.Model):
    type = models.CharField(verbose_name='Attribute Catergory', choices=ATTRIBUTE_TYPE, blank=True, null=True, max_length=150)
    name = models.CharField('Name', max_length=50, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='attribute_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='attribute_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name


class OneTSDomain(models.Model):
    name = models.CharField('One TS Domain Name', max_length=50, null=True)
    control_group = models.CharField('Control Group', max_length=50, null=True)
    group_name = models.CharField('Control Group', max_length=150, null=True)
    description = CKEditor5Field('One TS Domain Description', config_name='extends', max_length=4000, blank=True, null=True)
    data_steward = models.ForeignKey(DataSteward, on_delete=models.CASCADE, blank=True, null=True, related_name='contact')
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='one_ts_domain_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='one_ts_domain_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        # Ensure control_group and data_steward are handled for string conversion
        steward_name = self.data_steward.name if self.data_steward else "No Steward"
        return f"{self.name or 'Unnamed One TS Domain'} | {self.control_group or 'No Control Group'} | {steward_name}"

    class Meta:
        ordering = ['id']
        verbose_name = "One TS Domain"

class ADGroup(models.Model):
    name = models.CharField('Name', max_length=400, null=True)
    value = models.CharField('Value', max_length=400, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='ad_group_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='ad_group_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        # Ensure value is handled for string conversion
        return f"{self.name or 'Unnamed AD Group'} | {self.value or 'No Value'}"

    class Meta:
        ordering = ['id']
        verbose_name = "AD Group"


class FulfillmentTeam(models.Model):
    name = models.CharField('Team Name', max_length=50, null=True)
    team_manager = models.ForeignKey(Contact, on_delete=models.CASCADE, blank=True, null=True, related_name='fulfillment_team_contact')
    team_members = models.ForeignKey(Contact, on_delete=models.CASCADE, blank=True, null=True, related_name='fulfillment_team_members')
    route_id = models.CharField('Route Identifier', max_length=25, null=True)
    sys_id = models.CharField('1TS/SYS_ID', max_length=50, blank=True, null=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='ft_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=True, related_name='ft_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')

    def __str__(self):
        # Ensure route_id and is_active are handled for string conversion
        return f"{self.name or 'Unnamed Team'} | {self.route_id or 'No Route ID'} | {self.is_active}"

    class Meta:
        ordering = ['id']
        verbose_name = "Fulfillment Group"


class AlternateApprover(models.Model):
    name = models.CharField('Name', max_length=150, blank=True, null=True)
    sys_id = models.CharField('SYS_ID', max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Alternate Approver"
        verbose_name_plural = "Alternate Approvers"

    def __str__(self):
        return self.name or "Unnamed Alternate Approver"


class ProductQuerySet(models.QuerySet):
    """Shared publication rules for every public marketplace surface."""

    def published(self):
        return self.filter(is_active=True, status="approved")


class Product(models.Model):
    objects = ProductQuerySet.as_manager()
    name = models.CharField(verbose_name='Product Name', max_length=400, blank=True, null=True)
    slug = models.SlugField(verbose_name='Product Slug', max_length=800, unique=True, blank=True)
    brief_desc = CKEditor5Field(verbose_name='Brief Description', config_name='extends', max_length=4000, blank=True, null=True)
    whats_included = CKEditor5Field(verbose_name="What's Included", config_name='extends', max_length=4000, blank=True, null=True)
    intended_use_desc = CKEditor5Field(verbose_name='Intended Use Description', config_name='extends', max_length=4000, blank=True, null=True)
    short_desc = CKEditor5Field(verbose_name='Short Description', config_name='extends', max_length=1000, blank=True, null=True)
    domain = models.ForeignKey(Domain, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Domain Level 1', related_name='product_domain')
    subdomain_2 = models.ForeignKey(SubDomain_1, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Domain Level 2', related_name='product_subdomain_2')
    subdomain_3 = models.ForeignKey(SubDomain_2, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Domain Level 3', related_name='product_subdomain_3')
    datatype = models.ForeignKey(Datatype, on_delete=models.PROTECT, blank=False, null=True, verbose_name='Product Datatype')
    classification = models.ForeignKey(Classification, on_delete=models.PROTECT, blank=False, null=True, verbose_name='Product Classification')
    intended_use = CKEditor5Field(verbose_name='Intended Use', config_name='extends', max_length=800, blank=True, null=True, default='Not required for products with a Data Classification of Public or Protected')
    data_steward = models.ForeignKey(DataSteward, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Data Steward', related_name='data_steward')
    alt_approver = models.ForeignKey(AlternateApprover, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Alternate Approver', related_name='products')
    poc_name = models.ForeignKey(Contact, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Point of Contact', related_name='poc')
    business_contact_name = models.ForeignKey(Contact, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Business Contact', related_name='business_contact')
    business_sme = models.ForeignKey(Contact, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Business SME', related_name='business_sme')
    catalog = models.ForeignKey(Catalog, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Catalog Name', related_name='catalog_name')
    resource_url = models.CharField(verbose_name='Resource URL', max_length=1400, blank=True, null=True)
    original_name = models.CharField('Catalog Original Name', max_length=400, blank=True, null=True)
    route_identifier = models.ForeignKey(FulfillmentTeam, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Route Identifier', related_name='route_identifier')
    price = models.DecimalField(verbose_name='Price', decimal_places=2, max_digits=8, default='0.00')
    sku = models.CharField(verbose_name='Product SKU', blank=True, null=True, max_length=255)
    badge = models.ManyToManyField(Badge, blank=True)
    org = models.ForeignKey(Organization, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Organization')
    keyword = models.ManyToManyField(Keyword, blank=True)
    attribute = models.ManyToManyField(Attribute, blank=True)
    one_ts_domain = models.ForeignKey(OneTSDomain, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='One TS Domain')
    platform = models.ForeignKey(Platform, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Platform')
    ad_group = models.ForeignKey(ADGroup, on_delete=models.SET_NULL, blank=True, null=True, verbose_name=' AD Group')
    fulfillment_group = models.ForeignKey(FulfillmentTeam, on_delete=models.SET_NULL, blank=True, null=True, verbose_name=' Fulfillment Group')
    pi = models.CharField(verbose_name='Personal Information (PI)', choices=PI, blank=True, null=True, max_length=50)
    sensitive_pi = models.CharField(verbose_name='Sensitive Personal Information (SPI)', choices=SENSITIVE_PI, blank=True, null=True, max_length=50)
    usertype = models.CharField(verbose_name='User Access Type', default='TMNA User', max_length=50)
    access_type = models.CharField(verbose_name='Product Access Type', default='User Access', max_length=50)
    environment = models.CharField(verbose_name='Environment', default='Prod', max_length=50)
    data_access_type = models.CharField(verbose_name='Product Data Access Type', default='read', max_length=50)
    availability = models.CharField(verbose_name='Product Availability', default='24/7', max_length=50)
    frequency = models.CharField(verbose_name='Product Frequency', default='Multiple times a day', max_length=50)
    hide_me = models.CharField(verbose_name='Product Usage', default='Not Applicable', max_length=50)
    max = models.CharField(verbose_name='Product Max Usage', default='Small (1 - 100)', max_length=50)
    is_active = models.BooleanField(verbose_name='Active', default=False) # Changed default to False boolean
    team = models.ForeignKey('teams.Team', verbose_name='Team Ownership', on_delete=models.SET_NULL, related_name='products', null=True, blank=True)
    # Governance flags & cached status so we can filter quickly
    data_review_required = models.BooleanField(verbose_name='Data Review Board Required', default=False)
    data_review_status = models.CharField(verbose_name='Data Review Board Status' ,max_length=32, choices=DATA_REVIEW_BOARD_STATUS_CHOICES, default="not_required", db_index=True, )
    # Which team is responsible for governance review (defaults to "Data Review Board")
    data_review_team = models.ForeignKey('teams.Team', verbose_name='Data Review Team',on_delete=models.PROTECT, related_name="products_for_review", null=True, blank=True, help_text='Team responsible for governance review (defaults to "Data Review Board Team").')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='product_author_create')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='product_author_update')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_products')
    approved_at = models.DateTimeField(null=True, blank=True)
    cwpg_status = models.CharField(verbose_name='Content Manager Status', max_length=30, choices=CONTENT_STATUS_CHOICES, default='draft')
    status = models.CharField(verbose_name='Product Status', max_length=30, choices=PRODUCT_STATUS_CHOICES, default='draft')

    class Meta:
        ordering = ['id']
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            # GIN Index for lightning-fast text searching
            GinIndex(name='product_name_gin', fields=['name'], opclasses=['gin_trgm_ops']),
            GinIndex(name='product_sku_gin', fields=['sku'], opclasses=['gin_trgm_ops']),
        ]

    def __str__(self):
        # Use the name if available, otherwise fall back to a descriptive string with the ID
        return self.name if self.name else f"Product (ID: {self.id})"

    def _build_unique_slug(self):
        base_slug = slugify(self.name or "") or "product"
        candidate = base_slug
        suffix = 2
        while Product.objects.exclude(pk=self.pk).filter(slug=candidate).exists():
            candidate = f"{base_slug}-{suffix}"
            suffix += 1
        return candidate

    def _build_sku(self):
        domain_sku = str(self.domain.sku if self.domain else 0).zfill(3)
        subdomain_sku = str(self.subdomain_2.sku if self.subdomain_2 else 0).zfill(3)
        product_id = str(self.pk or 0).zfill(3)
        return f"{domain_sku}{subdomain_sku}{product_id}"

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = self._build_unique_slug()

        if self.status == "approved":
            if not self.approved_at:
                self.approved_at = timezone.now()
        else:
            self.approved_at = None
            self.approved_by = None

        super().save(*args, **kwargs)

        calculated_sku = self._build_sku()
        if self.sku != calculated_sku:
            Product.objects.filter(pk=self.pk).update(sku=calculated_sku)
            self.sku = calculated_sku

    def get_absolute_url(self):
        # You had two get_absolute_url methods. This one was last, so I'm keeping it.
        # If you need both, they need different names.
        return reverse('marketplace_admin:product_detail', kwargs={'pk': self.pk})

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField('Product Image', upload_to=product_image_upload_path, validators=[validate_image_extension], max_length=2000, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        if not self.alt_text and self.image:
            # FIX: changed 'filename' to 'self.image.name'
            import os
            self.alt_text = os.path.splitext(self.image.name)[0]
        super().save(*args, **kwargs)

class ProductAssociation(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_associations")
    associated_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="associated_product_links")
    is_related = models.BooleanField(default=False)
    is_additional = models.BooleanField(default=False)
    reason = models.CharField(max_length=255, blank=True)
    position = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        ordering = ["position"]
        constraints = [
            models.UniqueConstraint(fields=["product", "associated_product"], name="unique_product_association"),
            models.UniqueConstraint(fields=["product", "position"], name="unique_product_association_position"),
            models.CheckConstraint(check=~Q(product=F("associated_product")), name="prevent_self_product_association"),
            models.CheckConstraint(check=Q(is_related=True) | Q(is_additional=True), name="association_has_type"),
            models.CheckConstraint(check=Q(position__gte=1) & Q(position__lte=15), name="association_position_between_1_and_15"),
        ]

    def clean(self):
        super().clean()
        errors = {}
        if self.product_id and self.associated_product_id and self.product_id == self.associated_product_id:
            errors["associated_product"] = "A product cannot be associated with itself."
        if not self.is_related and not self.is_additional:
            errors["is_related"] = "Select Related, Additional, or both."
        if errors:
            raise ValidationError(errors)

    @property
    def association_type(self):
        if self.is_related and self.is_additional: return "both"
        return "related" if self.is_related else "additional"

    @property
    def badge_label(self):
        if self.is_related and self.is_additional: return "Related + Additional"
        return "Related Product" if self.is_related else "Additional Product"


class EndToEndSolutionProduct(models.Model):
    """
    Ordered marketplace product included in another product's
    End-to-End solution.

    The selected product's existing description is used by the
    admin and API, so no duplicate description is stored here.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="end_to_end_products",
    )

    solution_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="included_in_end_to_end_solutions",
    )

    position = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(15),
        ],
    )

    class Meta:
        ordering = (
            "position",
            "id",
        )

        verbose_name = "End-to-End product"
        verbose_name_plural = "End-to-End products"

        constraints = [
            models.UniqueConstraint(
                fields=(
                    "product",
                    "solution_product",
                ),
                name="unique_end_to_end_product",
            ),

            models.UniqueConstraint(
                fields=(
                    "product",
                    "position",
                ),
                name="unique_end_to_end_position",
            ),

            models.CheckConstraint(
                check=~Q(
                    product=F("solution_product")
                ),
                name="prevent_self_end_to_end_product",
            ),

            models.CheckConstraint(
                check=(
                    Q(position__gte=1) &
                    Q(position__lte=15)
                ),
                name="end_to_end_position_1_to_15",
            ),
        ]

    def clean(self):
        super().clean()

        errors = {}

        if (
            self.product_id and
            self.solution_product_id and
            self.product_id == self.solution_product_id
        ):
            errors["solution_product"] = (
                "A product cannot include itself in its "
                "End-to-End solution."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return str(self.solution_product)

class Synonym(models.Model):
    word = models.CharField(max_length=100, unique=True, db_index=True)
    synonyms = ArrayField(models.CharField(max_length=100), help_text="List of similar words")

    def __str__(self):
        return f"{self.word} -> {self.synonyms}"

class SearchQueryLog(models.Model):
    query = models.CharField(max_length=255)
    results_count = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Search Query Log"
        ordering = ['-created_at']


class SearchProductEmbedding(models.Model):
    product = models.OneToOneField(
        'marketplace.Product',  # Adjust app label as needed
        on_delete=models.CASCADE,
        related_name='search_embedding'
    )
    # 384 dimensions for all-MiniLM-L6-v2 model
    vector = VectorField(dimensions=384)
    metadata = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            # Use HNSW index for sub-millisecond similarity search
            # Note: Requires pgvector >= 0.5.0 and PostgreSQL extension enabled
            HnswIndex(
                name='search_vector_hnsw_idx',
                fields=['vector'],
                m=16,  # Number of neighbors per node (higher = better recall, slower build)
                ef_construction=64,  # Build time accuracy (higher = better recall, slower build)
                opclasses=['vector_cosine_ops']  # Matches CosineDistance queries
            ),
        ]
        db_table = 'search_product_embeddings'  # Optional: custom table name

    def __str__(self):
        return f"Embedding for {self.product.name}"

class Review(models.Model):
    STAR_CHOICES = [(i, str(i)) for i in range(1, 6)]
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=STAR_CHOICES)
    title = models.CharField(max_length=150, blank=True, default="")
    comment = models.TextField(blank=True, null=True)
    quality = models.PositiveSmallIntegerField(choices=STAR_CHOICES, null=True, blank=True)
    value_for_money = models.PositiveSmallIntegerField(choices=STAR_CHOICES, null=True, blank=True)
    ease_of_use = models.PositiveSmallIntegerField(choices=STAR_CHOICES, null=True, blank=True)
    durability = models.PositiveSmallIntegerField(choices=STAR_CHOICES, null=True, blank=True)
    would_recommend = models.BooleanField(null=True, blank=True)
    met_expectations = models.BooleanField(null=True, blank=True)
    verified_purchaser = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        unique_together = ('product', 'author')
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['product']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        # Ensure name is handled for string conversion
        product_name = self.product.name if self.product and self.product.name else "Unnamed Product"
        return f'Review by {self.author.username} for {product_name} - {self.rating} stars'