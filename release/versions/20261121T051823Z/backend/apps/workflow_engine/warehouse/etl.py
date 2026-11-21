from .models import WorkflowFact
class WarehouseLoader:
 @staticmethod
 def load_instance(instance):
  duration=int((instance.completed_at-instance.created_at).total_seconds()) if instance.completed_at else None
  return WorkflowFact.objects.update_or_create(instance_id=str(instance.pk),defaults={'tenant_key':getattr(instance.tenant,'key','') if getattr(instance,'tenant_id',None) else '','workflow_key':instance.workflow.key,'status':instance.status,'started_at':instance.created_at,'completed_at':instance.completed_at,'duration_seconds':duration,'sla_breached':bool(instance.due_at and instance.completed_at and instance.completed_at>instance.due_at),'total_cost':getattr(getattr(instance,'cost_summary',None),'total',None)})[0]
