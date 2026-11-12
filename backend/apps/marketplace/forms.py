import logging
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.forms import inlineformset_factory # Import inlineformset_factory
from django.forms.models import BaseInlineFormSet
from django_ckeditor_5.widgets import CKEditor5Widget
from django_select2.forms import Select2MultipleWidget, Select2Widget
from .models import (
    Badge,
    Product,
    Domain,
    SubDomain_1,
    SubDomain_2,
    Catalog,
    ProductImage,
    ProductAssociation,
    EndToEndSolutionProduct,
    catalog_resource_id_field,
)
from apps.teams.models import Team # Assuming this import is correct for your Team model

logger = logging.getLogger(__name__)

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ('image', 'alt_text', 'position')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        product = getattr(self.instance, "product", None)
        product_name = ((getattr(product, "name", None) or "")[:255])
        if product_name and "alt_text" in self.fields:
            self.fields["alt_text"].initial = product_name
            self.initial["alt_text"] = product_name

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if not image or not getattr(image, 'content_type', None):
            return image

        from PIL import Image, UnidentifiedImageError

        if image.size > 5 * 1024 * 1024:
            raise forms.ValidationError('Image file too large ( > 5MB )')

        image.seek(0)
        try:
            with Image.open(image) as opened:
                opened.verify()
        except (UnidentifiedImageError, OSError):
            raise forms.ValidationError('File must be an image.')
        finally:
            image.seek(0)

        return image

ProductImageFormSet = inlineformset_factory(
    Product,
    ProductImage,
    form=ProductImageForm,
    fields=('image', 'alt_text', 'position'),
    extra=0,
    max_num=5,
    validate_max=True,
    can_delete=True,
    widgets={
        'image': forms.FileInput(attrs={
            'class': 'form-control image-input',
            'accept': 'image/*'
        }),
        'alt_text': forms.TextInput(attrs={
            'class': 'form-control image-alt-text',
            'placeholder': 'Alt text',
            'readonly': 'readonly',
        }),
        'position': forms.HiddenInput(attrs={
            'class': 'image-position',
        }),
    }
)


def _other_products(parent_id):
    rows = Product.objects.order_by("name")
    if parent_id:
        rows = rows.exclude(pk=parent_id)
    return rows


def _label_product(product):
    return product.name or f"Product {product.pk}"


class ProductAssociationForm(forms.ModelForm):
    class Meta:
        model = ProductAssociation
        fields = ("associated_product", "is_related", "is_additional", "reason")
        labels = {
            "associated_product": "Associated Product",
            "is_related": "Related",
            "is_additional": "Similar",
            "reason": "Reason",
        }

    def __init__(self, *args, **kwargs):
        parent_id = kwargs.pop("parent_id", None)
        super().__init__(*args, **kwargs)
        parent_id = parent_id or getattr(self.instance, "product_id", None)
        field = self.fields["associated_product"]
        field.queryset = _other_products(parent_id)
        field.label_from_instance = _label_product
        field.widget.attrs["class"] = "form-select"
        field.widget.attrs["data-placeholder"] = "Associated Product"
        field.empty_label = "Associated Product"
        self.fields["reason"].widget.attrs["class"] = "form-control"
        self.fields["reason"].widget.attrs["placeholder"] = "Reason"


class EndToEndSolutionForm(forms.ModelForm):
    class Meta:
        model = EndToEndSolutionProduct
        fields = ("solution_product",)
        labels = {"solution_product": "Solution Product"}

    def __init__(self, *args, **kwargs):
        parent_id = kwargs.pop("parent_id", None)
        super().__init__(*args, **kwargs)
        parent_id = parent_id or getattr(self.instance, "product_id", None)
        field = self.fields["solution_product"]
        field.queryset = _other_products(parent_id)
        field.label_from_instance = _label_product
        field.widget.attrs["class"] = "form-select"


class _PositionedInlineFormSet(BaseInlineFormSet):
    max_rows = 15

    def get_form_kwargs(self, index):
        kwargs = super().get_form_kwargs(index)
        kwargs["parent_id"] = self.instance.pk
        return kwargs

    def clean(self):
        super().clean()
        if any(self.errors):
            return
        seen = set()
        active = 0
        product_field = self.product_field
        for form in self.forms:
            cleaned = getattr(form, "cleaned_data", None)
            if not cleaned or cleaned.get("DELETE"):
                continue
            chosen = cleaned.get(product_field)
            if chosen is None:
                continue
            active += 1
            if self.instance.pk and chosen.pk == self.instance.pk:
                form.add_error(product_field, "A product cannot include itself.")
            if chosen.pk in seen:
                form.add_error(product_field, "This product is selected more than once.")
            else:
                seen.add(chosen.pk)
            self.validate_row(form, cleaned)
        if active > self.max_rows:
            raise ValidationError(f"A product can have a maximum of {self.max_rows} rows.")

    def validate_row(self, form, cleaned):
        return None

    def save_new(self, form, commit=True):
        instance = form.save(commit=False)
        if not instance.position:
            highest = (
                self.model.objects.filter(product=self.instance)
                .order_by("-position")
                .values_list("position", flat=True)
                .first()
            )
            instance.position = (highest or 0) + 1
        if commit:
            instance.save()
        return instance


class ProductAssociationInlineFormSet(_PositionedInlineFormSet):
    product_field = "associated_product"
    max_rows = 10

    def validate_row(self, form, cleaned):
        if not cleaned.get("is_related") and not cleaned.get("is_additional"):
            form.add_error("is_related", "Select Related, Similar, or both.")


class EndToEndSolutionInlineFormSet(_PositionedInlineFormSet):
    product_field = "solution_product"
    max_rows = 10


ProductAssociationFormSet = inlineformset_factory(
    Product,
    ProductAssociation,
    form=ProductAssociationForm,
    formset=ProductAssociationInlineFormSet,
    fk_name="product",
    extra=1,
    max_num=10,
    validate_max=True,
    can_delete=True,
)

EndToEndSolutionFormSet = inlineformset_factory(
    Product,
    EndToEndSolutionProduct,
    form=EndToEndSolutionForm,
    formset=EndToEndSolutionInlineFormSet,
    fk_name="product",
    extra=1,
    max_num=10,
    validate_max=True,
    can_delete=True,
)

class ProductForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        # Extract request BEFORE calling super()
        self.request = kwargs.pop('request', None)

        # Call parent's __init__ method
        super().__init__(*args, **kwargs)

        # Apply Bootstrap styling to all fields
        for field_name, field in self.fields.items():
            field.widget.attrs.setdefault('class', 'form-control col-md-6')

        # Apply Bootstrap styling to most fields
        for field_name, field in self.fields.items():
            # Exclude boolean fields from generic 'form-control' class as it breaks checkboxes
            if not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.setdefault('class', 'form-control col-md-12')

        # --- Fields to make READ-ONLY directly in the form ---
        read_only_fields = ['slug', 'sku', 'price']
        for field_name in read_only_fields:
            if field_name in self.fields:
                self.fields[field_name].widget.attrs['readonly'] = 'readonly'
        # --- End Read-Only Section ---

        # --- Disable specific fields ---
        disabled_fields = ['slug', 'sku', 'price']
        for field_name in disabled_fields:
            if field_name in self.fields:
                self.fields[field_name].disabled = True

        # Explicitly set CheckboxInput for boolean fields
        self.fields['data_review_required'].widget = forms.CheckboxInput(attrs={'class': 'form-check-input'})
        self.fields['is_active'].widget = forms.CheckboxInput(attrs={'class': 'form-check-input'})

        # Specific field configurations (preserved from your original __init__)
        self.fields['name'].widget.attrs.update({})
        self.fields['slug'].widget.attrs.update({'readonly': 'readonly'})
        self.fields['short_desc'].widget.attrs.update({})
        self.fields['brief_desc'].widget.attrs.update({})
        self.fields['whats_included'].widget.attrs.update({})
        self.fields['intended_use_desc'].widget.attrs.update({})
        self.fields['catalog'].widget.attrs.update({})
        self.fields['domain'].widget.attrs.update({})
        self.fields['subdomain_2'].widget.attrs.update({})
        self.fields['subdomain_3'].widget.attrs.update({})
        self.fields['datatype'].widget.attrs.update({})
        self.fields['classification'].widget.attrs.update({})
        self.fields['intended_use'].widget.attrs.update({})
        self.fields['data_steward'].widget.attrs.update({})
        self.fields['data_steward'].label_from_instance = lambda steward: steward.name or ""
        self.fields['poc_name'].widget.attrs.update({})
        self.fields['business_contact_name'].widget.attrs.update({})
        self.fields['business_sme'].widget.attrs.update({})
        self.fields['resource'].widget.attrs.update({})
        self.fields['resource'].label_from_instance = lambda catalog: (
            catalog.resourcetype.name if catalog.resourcetype_id and catalog.resourcetype else (catalog.name or "")
        )
        catalog_id = None
        if self.data:
            catalog_id = self.data.get(self.add_prefix("catalog")) or None
        if not catalog_id and self.instance and self.instance.catalog_id:
            catalog_id = self.instance.catalog_id
        resource_qs = Catalog.objects.select_related("resourcetype", "resourcetype__type")
        if catalog_id:
            resource_qs = resource_qs.filter(pk=catalog_id)
        self.fields["resource"].queryset = resource_qs
        if "collibra_id" in self.fields:
            self.fields["collibra_id"].required = False
        self.fields["resource_identifier"] = forms.CharField(
            label="Resource ID",
            required=False,
            widget=forms.TextInput(attrs={"class": "form-control", "autocomplete": "off"}),
        )
        if not self.is_bound:
            target = catalog_resource_id_field(getattr(self.instance, "catalog", None))
            if target:
                self.initial["resource_identifier"] = getattr(self.instance, target, None) or ""
        self.fields['price'].widget.attrs.update({'step': 'any'})
        self.fields['sku'].widget.attrs.update({'disabled': False})
        self.fields['badge'].widget.attrs.update({})
        self.fields['badge'].queryset = Badge.objects.filter(
            Q(is_system=False, is_active=True) | Q(system_key__in=["editors_choice", "staff_pick"])
        ).order_by("name")
        self.fields['platform'].widget.attrs.update({})
        self.fields['platform'].label_from_instance = lambda platform: (platform.name or "").split(" (", 1)[0]
        self.fields['org'].widget.attrs.update({})
        self.fields['keyword'].widget.attrs.update({})
        self.fields['attribute'].widget.attrs.update({})
        self.fields['one_ts_domain'].widget.attrs.update({})
        self.fields['one_ts_domain'].label_from_instance = lambda domain: domain.name or ""
        self.fields['ad_group'].widget.attrs.update({})
        self.fields['pi'].widget.attrs.update({})
        self.fields['sensitive_pi'].widget.attrs.update({})
        self.fields['data_review_required'].widget.attrs.update({})
        self.fields['data_review_status'].widget.attrs.update({})
        self.fields['data_review_team'].widget.attrs.update({})
        self.fields['is_active'].widget.attrs.update({})
        self.fields['status'].widget.attrs.update({})

        # Additional configurations (preserved from your original __init__)
        if 'slug' in self.fields:
            self.fields['slug'].widget.attrs.update({'readonly': 'readonly'})
        if 'price' in self.fields:
            self.fields['price'].widget.attrs.update({'readonly': 'readonly'})

        # Initial setup for Data Review fields based on instance value
        if self.instance and self.instance.data_review_required:
            self.fields['data_review_status'].widget.attrs['disabled'] = 'disabled'

        # The review team list comes from the database and starts unselected.
        self.fields['data_review_team'].empty_label = "-- Select an option --"
        try:
            data_review_board_team = Team.objects.get(name="Data Review Board Team")
            self.fields['data_review_team'].queryset = Team.objects.filter(pk=data_review_board_team.pk)
        except Team.DoesNotExist:
            self.fields['data_review_team'].queryset = Team.objects.none()

        # You can now access self.request anywhere in the form
        if self.request and self.request.user.is_authenticated:
            # Example: Filter querysets based on user/team
            # self.fields['data_steward'].queryset = Team.objects.filter(members=self.request.user)
            pass

    class Meta:
        model = Product
        fields = ('name', 'slug',
                  'status', 'price', 'sku', 'catalog', 'datatype', 'classification', 'platform', 'one_ts_domain',
                  'org',
                  'pi', 'sensitive_pi', 'data_steward', 'alt_approver', 'poc_name', 'business_contact_name', 'business_sme',
                  'domain', 'subdomain_2', 'subdomain_3',
                  'resource', 'badge', 'org', 'keyword', 'attribute', 'ad_group',
                  'data_review_required', 'data_review_status', 'data_review_team',
                  'short_desc', 'brief_desc', 'whats_included', 'intended_use_desc', 'intended_use',
                  'is_active')
        exclude = ['created_at', 'updated_at', 'created_by', 'updated_by'] # Exclude auto-managed fields
        widgets = {
            'keyword': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'badge': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'attribute': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'status': Select2Widget(attrs={'class': 'form-control col-md-12'}),
            # You can add CKEditor5Widget for brief_desc and short_desc if they are not picked up automatically
            'brief_desc': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
            'whats_included': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
            'intended_use_desc': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
            'short_desc': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
            'intended_use': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        data_review_required = cleaned_data.get('data_review_required')
        datatype = cleaned_data.get('datatype')
        classification = cleaned_data.get('classification')

        if not datatype:
            self.add_error('datatype', 'Product Datatype is required.')

        if not classification:
            self.add_error('classification', 'Product Classification is required.')

        catalog = cleaned_data.get("catalog")
        resource = cleaned_data.get("resource")
        if catalog and resource:
            catalog_type_id = catalog.resourcetype_id
            resource_type_id = resource.resourcetype_id
            if catalog_type_id and resource_type_id and catalog_type_id != resource_type_id:
                self.add_error("resource", "Resource must match the resource type for the selected catalog.")

        if data_review_required:
            cleaned_data['data_review_status'] = 'pending'
        else:
            # When not required, clear the values
            cleaned_data['data_review_status'] = 'not_required'
            cleaned_data['data_review_team'] = None

        return cleaned_data

    def save(self, commit=True):
        product = super().save(commit=False)
        token = (self.cleaned_data.get("resource_identifier") or "").strip()
        target = catalog_resource_id_field(self.cleaned_data.get("catalog"))
        product.collibra_id = token or None if target == "collibra_id" else None
        product.api_id = token or None if target == "api_id" else None
        if commit:
            product.save()
            self.save_m2m()
        return product

# The following forms are preserved as they were in your original forms.py
class DomainForm(forms.ModelForm): # Changed to forms.ModelForm for Meta class to work
    def __init__(self, *args, **kwargs):
        super(DomainForm, self).__init__(*args, **kwargs)
        self.fields['sku'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['image'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['name'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['description'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['slug'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['level'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['is_active'].widget.attrs = {'class': 'form-control col-md-12'}

    class Meta:
        model = Domain
        fields = ('name', 'description', 'slug', 'level', 'is_active')

class SubDomain_1Form(forms.ModelForm): # Changed to forms.ModelForm
    def __init__(self, *args, **kwargs):
        super(SubDomain_1Form, self).__init__(*args, **kwargs)
        self.fields['sku'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['image'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['name'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['description'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['slug'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['level'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['domain'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['is_active'].widget.attrs = {'class': 'form-control col-md-12'}

    class Meta:
        model = SubDomain_1
        fields = ('name', 'description', 'slug', 'level', 'is_active')

class SubDomain_2Form(forms.ModelForm): # Changed to forms.ModelForm
    def __init__(self, *args, **kwargs):
        super(SubDomain_2Form, self).__init__(*args, **kwargs)
        self.fields['sku'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['image'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['name'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['description'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['slug'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['level'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['subdomain_1'].widget.attrs = {'class': 'form-control col-md-12'}
        self.fields['is_active'].widget.attrs = {'class': 'form-control col-md-12'}

    class Meta:
        model = SubDomain_2
        fields = ('name', 'description', 'slug', 'level', 'is_active')

# The `level0`, `level1`, `level2`, and the __init__ method below them
# seem to be part of a separate, incomplete form or logic.
# If they are meant to be part of ProductForm, they need to be integrated
# within ProductForm's structure. For now, they are commented out to prevent
# syntax errors and confusion, as they were outside of any class definition.
"""
level0 = forms.ModelChoiceField(queryset=Domain.objects.all(), required=True)
level1 = forms.ModelChoiceField(queryset=SubDomain_1.objects.none(), required=True)
level2 = forms.ModelChoiceField(queryset=SubDomain_2.objects.none(), required=True)

def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)

    if 'level0' in self.data:
        try:
            level0_id = int(self.data.get('level0'))
            self.fields['level1'].queryset = SubDomain_1.objects.filter(parent_id=level0_id).order_by('id')
        except (ValueError, TypeError):
            pass  # fallback to empty queryset

    if 'level1' in self.data:
        try:
            level1_id = int(self.data.get('level1'))
            self.fields['level2'].queryset = SubDomain_2.objects.filter(parent_id=level1_id).order_by('id')
        except (ValueError, TypeError):
            pass  # fallback to empty queryset
"""

class CatalogForm(forms.ModelForm):
    class Meta:
        model = Catalog
        fields = '__all__'