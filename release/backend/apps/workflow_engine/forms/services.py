from django.core.exceptions import ValidationError
from django.utils import timezone
class FormService:
 @staticmethod
 def validate(form,data):
  errors=[]
  for field in form.fields.all():
   value=data.get(field.key)
   if field.required and value in (None,'',[]):errors.append({'field':field.key,'message':'This field is required.'})
   if value is not None and field.field_type=='number' and not isinstance(value,(int,float)):errors.append({'field':field.key,'message':'Expected a number.'})
  return errors
 @staticmethod
 def submit(submission):
  errors=FormService.validate(submission.form,submission.data);submission.validation_errors=errors
  if errors:submission.status='invalid';submission.save();raise ValidationError(errors)
  submission.status='submitted';submission.submitted_at=timezone.now();submission.save();return submission
