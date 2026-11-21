import hashlib, uuid
from apps.notifications.models import AssistantInteraction, Notification
from .tenancy import get_current_application, get_current_tenant
class MasterNotificationAssistant:
    def run(self, *, user, request_type, notification_id=None):
        tenant=get_current_tenant(); app=get_current_application(); qs=Notification.objects.for_user(user).active()
        if tenant is not None: qs=qs.filter(tenant=tenant)
        if app is not None: qs=qs.filter(application=app)
        if notification_id: qs=qs.filter(pk=notification_id)
        items=list(qs.filter(action_required=True)[:50] if request_type=="action_items" else qs.filter(read=False)[:50])
        result={"summary":f"{len(items)} authorized notifications included.","notification_ids":[n.pk for n in items],"evidence":[{"id":n.pk,"title":n.title,"source":n.source} for n in items],"limitations":["Deterministic provider"]}
        AssistantInteraction.objects.create(tenant=tenant,application=app,user=user,request_type=request_type,prompt_hash=hashlib.sha256(request_type.encode()).hexdigest(),provider="deterministic",model_name="evidence-v1",result=result,source_notification_ids=result["notification_ids"],limitations=result["limitations"],correlation_id=uuid.uuid4())
        return result
