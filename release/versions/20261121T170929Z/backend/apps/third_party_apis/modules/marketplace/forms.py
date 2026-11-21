import logging
from django import forms
from django.forms import inlineformset_factory # Import inlineformset_factory
from django_ckeditor_5.widgets import CKEditor5Widget
from django_select2.forms import Select2MultipleWidget, Select2Widget
from .models import Product, Domain, SubDomain_1, SubDomain_2, Catalog, ProductImage
from apps.teams.models import Team # Assuming this import is correct for your Team model

logger = logging.getLogger(__name__)

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ('image', 'alt_text')

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Validate file type more thoroughly
            import magic
            file_type = magic.from_buffer(image.read(1024), mime=True)
            if not file_type.startswith('image/'):
                raise forms.ValidationError('File must be an image.')

            # Reset file pointer
            image.seek(0)

            # Check file size (5MB limit)
            if image.size > 5 * 1024 * 1024:
                raise forms.ValidationError('Image file too large ( > 5MB )')

        return image

ProductImageFormSet = inlineformset_factory(
    Product,
    ProductImage,
    form=ProductImageForm,
    fields=('image', 'alt_text'),
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
            'class': 'form-control',
            'placeholder': 'Alt text',
            'disabled': 'disabled'
        })
    }
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
        self.fields['catalog'].widget.attrs.update({})
        self.fields['domain'].widget.attrs.update({})
        self.fields['subdomain_2'].widget.attrs.update({})
        self.fields['subdomain_3'].widget.attrs.update({})
        self.fields['datatype'].widget.attrs.update({})
        self.fields['classification'].widget.attrs.update({})
        self.fields['intended_use'].widget.attrs.update({})
        self.fields['data_steward'].widget.attrs.update({})
        self.fields['poc_name'].widget.attrs.update({})
        self.fields['business_contact_name'].widget.attrs.update({})
        self.fields['business_sme'].widget.attrs.update({})
        self.fields['resource_url'].widget.attrs.update({})
        self.fields['price'].widget.attrs.update({'step': 'any'})
        self.fields['sku'].widget.attrs.update({'disabled': False})
        self.fields['badge'].widget.attrs.update({})
        self.fields['platform'].widget.attrs.update({})
        self.fields['org'].widget.attrs.update({})
        self.fields['keyword'].widget.attrs.update({})
        self.fields['attribute'].widget.attrs.update({})
        self.fields['one_ts_domain'].widget.attrs.update({})
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
            self.fields['data_review_team'].widget.attrs['disabled'] = 'disabled'

        # Filter for Data Review Team to only show "Data Review Board"
        try:
            data_review_board_team = Team.objects.get(name="Data Review Board")
            self.fields['data_review_team'].queryset = Team.objects.filter(pk=data_review_board_team.pk)
        except Team.DoesNotExist:
            self.fields['data_review_team'].queryset = Team.objects.none()  # Fallback if team doesn't exist

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
                  'pi', 'sensitive_pi', 'data_steward', 'poc_name', 'business_contact_name', 'business_sme',
                  'domain', 'subdomain_2', 'subdomain_3',
                  'resource_url', 'badge', 'org', 'keyword', 'attribute', 'ad_group',
                  'data_review_required', 'data_review_status', 'data_review_team',
                  'short_desc', 'brief_desc', 'intended_use',
                  'is_active')
        exclude = ['created_at', 'updated_at', 'created_by', 'updated_by'] # Exclude auto-managed fields
        widgets = {
            'keyword': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'badge': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'attribute': Select2MultipleWidget(attrs={'class': 'form-control col-md-12'}),
            'status': Select2Widget(attrs={'class': 'form-control col-md-12'}),
            # You can add CKEditor5Widget for brief_desc and short_desc if they are not picked up automatically
            'brief_desc': CKEditor5Widget(config_name='extends', attrs={'class': 'django_ckeditor_5 form-control col-md-12'}),
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

        if data_review_required:
            # When required is True, status and team should be set but fields are disabled
            cleaned_data['data_review_status'] = 'pending'
            try:
                data_review_board_team = Team.objects.get(name="Data Review Board")
                cleaned_data['data_review_team'] = data_review_board_team
            except Team.DoesNotExist:
                pass
        else:
            # When not required, clear the values
            cleaned_data['data_review_status'] = 'not_required'
            cleaned_data['data_review_team'] = None

        return cleaned_data

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