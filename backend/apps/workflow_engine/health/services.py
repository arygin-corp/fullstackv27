from decimal import Decimal
from django.utils import timezone
from .models import WorkflowHealthSnapshot
class HealthService:
 @staticmethod
 def calculate(workflow):
  qs=workflow.instances.all();running=qs.filter(status='running').count();failed=qs.filter(status='failed').count();overdue=qs.filter(status='running',due_at__lt=timezone.now()).count();dead=workflow.instances.filter(status='failed').count();penalty=min(100,failed*10+overdue*5);score=max(0,100-penalty);status='healthy' if score>=90 else ('warning' if score>=70 else 'critical');signals={'running':running,'failed':failed,'overdue':overdue,'failure_penalty':penalty};return WorkflowHealthSnapshot.objects.create(workflow=workflow,score=Decimal(str(score)),status=status,signals=signals)
