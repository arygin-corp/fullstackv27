from django import forms
from django_select2.forms import ModelSelect2Widget, ModelSelect2MultipleWidget
from .models import Team
from django.contrib.auth import get_user_model
User = get_user_model()

class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        fields = ['name','slug','description','icon','logo','cover_image','owner','members']
        widgets = {
            'owner': ModelSelect2Widget(model=User, search_fields=['username__icontains','email__icontains']),
            'members': ModelSelect2MultipleWidget(model=User, search_fields=['username__icontains','email__icontains']),
        }
