from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import InstanceMigration
class MigrationService:
 @staticmethod
 def validate(plan):
  errors=[];source={s.key for s in plan.source.states.all()};target={s.key for s in plan.target.states.all()}
  for old,new in plan.state_mapping.items():
   if old not in source:errors.append(f'Unknown source state: {old}')
   if new not in target:errors.append(f'Unknown target state: {new}')
  return errors
 @staticmethod
 @transaction.atomic
 def migrate(instance,plan):
  if instance.workflow_id!=plan.source_id:raise ValidationError('Instance does not use the source definition.')
  errors=MigrationService.validate(plan)
  if errors:raise ValidationError(errors)
  locked=type(instance).objects.select_for_update().select_related('current_state').get(pk=instance.pk);target_key=plan.state_mapping.get(locked.current_state.key)
  if not target_key:raise ValidationError('No state mapping for the current state.')
  record=InstanceMigration.objects.create(plan=plan,instance=locked,source_state_key=locked.current_state.key,snapshot={'workflow_id':locked.workflow_id,'state_id':locked.current_state_id,'context':locked.context})
  try:
   target=plan.target.states.get(key=target_key);locked.workflow=plan.target;locked.current_state=target;locked.revision+=1;locked.save();record.target_state_key=target_key;record.status='completed';record.migrated_at=timezone.now();record.save();return record
  except Exception as exc:record.status='failed';record.error=str(exc);record.save();raise
