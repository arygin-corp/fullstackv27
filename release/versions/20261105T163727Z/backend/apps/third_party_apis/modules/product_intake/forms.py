from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import IntakeProductTags, ProductIntake


class IntakeProductTagsForm(forms.ModelForm):
    class Meta:
        model=IntakeProductTags
        fields=("name","is_active")


class ProductIntakeForm(forms.ModelForm):
    """Legacy Django form retained; Angular/REST is the primary interface."""
    class Meta:
        model=ProductIntake
        fields=("product_name","product_desc","product_type","product_url","product_tags","product_domain","stakeholder_name","product_pii","product_spi","pii_explanation","fulfillment_group","requester_first_name","requester_last_name","requester_email","submitted_by_first_name","submitted_by_last_name","submitted_by_email","marketplace_domain","marketplace_datatype","marketplace_classification")
        widgets={"product_desc":CKEditor5Widget(config_name="extends"),"pii_explanation":CKEditor5Widget(config_name="extends"),"product_tags":forms.SelectMultiple()}
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        for field in self.fields.values(): field.widget.attrs.setdefault("class","form-control col-md-12")
