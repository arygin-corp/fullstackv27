from django import forms
from .models import Brand, Document, Homepage, Media, Policie, Processe, ResourceChangeAttachment, ResourceChangeRequest

class BaseResourceForm(forms.ModelForm):
    def clean(self):
        data=super().clean()
        self.instance.full_clean(exclude=[name for name in self._errors])
        return data

class HomepageForm(BaseResourceForm):
    class Meta: model=Homepage; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class BrandForm(BaseResourceForm):
    class Meta: model=Brand; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class DocumentForm(BaseResourceForm):
    class Meta: model=Document; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class PolicieForm(BaseResourceForm):
    class Meta: model=Policie; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class ProcesseForm(BaseResourceForm):
    class Meta: model=Processe; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class MediaForm(BaseResourceForm):
    class Meta: model=Media; exclude=('created_by','created_at','updated_by','updated_at','archived_by','archived_at')
class ResourceChangeRequestForm(BaseResourceForm):
    class Meta: model=ResourceChangeRequest; fields=('resource_type','resource_id','action','proposed_data','comment')
class ResourceChangeAttachmentForm(BaseResourceForm):
    class Meta: model=ResourceChangeAttachment; fields=('file',)
