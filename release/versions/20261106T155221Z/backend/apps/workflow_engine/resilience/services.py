from django.db.models import Q
from django.utils import timezone
from .models import ExecutionFreeze
class FreezeService:
 @staticmethod
 def is_frozen(instance):
  return ExecutionFreeze.objects.filter(active=True).filter(Q(scope='global')|Q(tenant=instance.tenant)|Q(workflow=instance.workflow)|Q(instance=instance)).exists()
 @staticmethod
 def release(freeze,user=None):freeze.active=False;freeze.released_by=user;freeze.released_at=timezone.now();freeze.save();return freeze
