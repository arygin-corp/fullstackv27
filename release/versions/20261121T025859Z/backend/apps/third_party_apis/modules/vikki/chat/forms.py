from django import forms
from .models import MemoryItem, MemoryProfile
class MemoryProfileForm(forms.ModelForm):
    class Meta:
        model=MemoryProfile
        fields=("enabled","custom_instructions")
        widgets={"custom_instructions":forms.Textarea(attrs={"rows":4,"placeholder":"Optional instructions you explicitly want remembered"})}
class MemoryItemForm(forms.ModelForm):
    class Meta:
        model=MemoryItem
        fields=("kind","content")
        widgets={"content":forms.Textarea(attrs={"rows":2,"placeholder":"A preference, goal, project, fact, or instruction"})}
