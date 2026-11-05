from django.utils import timezone
from django.db.models import Q
from ..security_models import DedicatedStaffAssignment,WorkflowAccessPolicy
class WorkflowAuthorization:
    @staticmethod
    def _tenant_member(user,tenant):
        return bool(user and user.is_authenticated and tenant.memberships.filter(user=user,active=True).exists())
    @staticmethod
    def allowed(*,user,tenant,action,workflow=None,instance=None,state=None,role=''):
        if not WorkflowAuthorization._tenant_member(user,tenant): return False
        if user.is_superuser: return True
        now=timezone.now(); policies=WorkflowAccessPolicy.objects.filter(tenant=tenant,action=action,active=True).filter(Q(workflow=workflow)|Q(workflow__isnull=True))
        if role: policies=policies.filter(Q(role=role)|Q(role=''))
        user_groups=user.groups.values_list('pk',flat=True)
        policies=policies.filter(groups__in=user_groups).distinct()
        for policy in policies:
            if not policy.requires_dedicated_staff:return True
            staffing=DedicatedStaffAssignment.objects.filter(tenant=tenant,user=user,group__in=user_groups,active=True,starts_at__lte=now).filter(Q(ends_at__isnull=True)|Q(ends_at__gt=now))
            scope=Q()
            if instance: scope|=Q(instance=instance)
            if workflow: scope|=Q(workflow=workflow)
            if state: scope|=Q(state=state)
            if policy.role: staffing=staffing.filter(role=policy.role)
            if staffing.filter(scope).exists():return True
        return False
    @staticmethod
    def filter_instances(*,user,tenant,action='view'):
        from .models import WorkflowInstance
        if not WorkflowAuthorization._tenant_member(user,tenant):return WorkflowInstance.objects.none()
        if user.is_superuser:return WorkflowInstance.objects.filter(tenant=tenant)
        now=timezone.now(); groups=user.groups.values_list('pk',flat=True)
        workflow_ids=WorkflowAccessPolicy.objects.filter(tenant=tenant,action=action,active=True,groups__in=groups).values_list('workflow_id',flat=True)
        staffed=DedicatedStaffAssignment.objects.filter(tenant=tenant,user=user,group__in=groups,active=True,starts_at__lte=now).filter(Q(ends_at__isnull=True)|Q(ends_at__gt=now))
        return WorkflowInstance.objects.filter(tenant=tenant).filter(Q(pk__in=staffed.values('instance_id'))|Q(workflow_id__in=staffed.values('workflow_id')) & Q(workflow_id__in=workflow_ids)).distinct()
