from django.utils import timezone
from ..models import EscalationEvent, Notification, WorkflowInstance

def process_slas():
    count=0
    for instance in WorkflowInstance.objects.filter(status='running',due_at__lt=timezone.now()).select_related('workflow','current_state'):
        rule=instance.workflow.sla_rules.filter(state=instance.current_state).first()
        if rule and not instance.escalations.filter(rule=rule).exists():
            EscalationEvent.objects.create(instance=instance,rule=rule,escalated_to_role=rule.escalate_to_role,details={'reason':'sla_overdue'})
            count+=1
    return count

def deliver_notifications(adapter):
    for item in Notification.objects.filter(status='pending')[:100]:
        try: adapter.send(item); item.status='sent'; item.sent_at=timezone.now(); item.attempts+=1; item.save()
        except Exception as exc: item.status='failed'; item.last_error=str(exc); item.attempts+=1; item.save()
