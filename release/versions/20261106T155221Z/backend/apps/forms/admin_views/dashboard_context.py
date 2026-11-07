from __future__ import annotations

from datetime import timedelta
from django.apps import apps
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone


def _model(*names):
    for model in apps.get_models():
        if model.__name__.lower() in {name.lower() for name in names}:
            return model
    return None


def _fields(model):
    return {field.name for field in model._meta.get_fields()} if model else set()


def _count(model, filters=None):
    if not model:
        return 0
    queryset=model.objects.all()
    return queryset.filter(**filters).count() if filters else queryset.count()


def build_dar_dashboard_context(days=30):
    Form=_model('Form','DynamicForm','DARForm')
    Submission=_model('Submission','FormSubmission','Request')
    RoutingRule=_model('RoutingRule')
    RuleGroup=_model('RuleGroup','RoutingRuleGroup')
    ValidationRule=_model('ValidationRule')
    Audit=_model('AuditLog','AuditEvent','ChangeLog')
    sf=_fields(Submission)
    ff=_fields(Form)
    rf=_fields(RoutingRule)
    vf=_fields(ValidationRule)
    af=_fields(Audit)

    status_field='status' if 'status' in sf else None
    created_field='created_at' if 'created_at' in sf else None
    submitted_by_field='submitted_by' if 'submitted_by' in sf else None
    form_field='form' if 'form' in sf else None
    published_filter={'is_published':True} if 'is_published' in ff else ({'status':'published'} if 'status' in ff else None)
    active_rule_filter={'is_active':True} if 'is_active' in rf else None

    total_requests=_count(Submission)
    completed=_count(Submission,{status_field:'completed'}) if status_field else 0
    rejected=_count(Submission,{status_field:'rejected'}) if status_field else 0
    open_statuses=['submitted','processing','pending','in_review']
    open_requests=Submission.objects.filter(**{f'{status_field}__in':open_statuses}).count() if Submission and status_field else 0
    sla_compliance=round((completed/max(completed+rejected,1))*100,1)

    status_chart=[]
    if Submission and status_field:
        status_chart=list(Submission.objects.values(status_field).annotate(total=Count('pk')).order_by(status_field))
        for row in status_chart: row['status']=row.pop(status_field) or 'Unknown'

    submissions_by_day=[]
    if Submission and created_field:
        start=timezone.now()-timedelta(days=days)
        submissions_by_day=list(Submission.objects.filter(**{f'{created_field}__gte':start}).annotate(day_value=TruncDate(created_field)).values('day_value').annotate(total=Count('pk')).order_by('day_value'))
        submissions_by_day=[{'day':row['day_value'].isoformat(),'total':row['total']} for row in submissions_by_day if row['day_value']]

    top_forms=[]
    if Form and Submission and form_field:
        related_name=next((r.get_accessor_name() for r in Form._meta.related_objects if r.related_model==Submission),None)
        if related_name:
            top_forms=list(Form.objects.annotate(submission_count=Count(related_name)).order_by('-submission_count').values('pk','name','submission_count')[:10])

    recent_submissions=Submission.objects.select_related(form_field).order_by(f'-{created_field}')[:10] if Submission and created_field and form_field else (Submission.objects.order_by('-pk')[:10] if Submission else [])
    audit_action='action' if 'action' in af else None
    audit_created='created_at' if 'created_at' in af else None
    audit_stats={'creates':0,'updates':0,'deletes':0,'today':0}
    recent_changes=[]
    if Audit:
        if audit_action:
            for key in ('creates','updates','deletes'):
                audit_stats[key]=Audit.objects.filter(**{f'{audit_action}__iexact':key[:-1]}).count()
        if audit_created:
            audit_stats['today']=Audit.objects.filter(**{f'{audit_created}__date':timezone.localdate()}).count()
            recent_changes=Audit.objects.order_by(f'-{audit_created}')[:10]

    health_checks=[
        {'label':'Database','status':'Connected','level':'success'},
        {'label':'Forms','status':f'{_count(Form)} configured','level':'success'},
        {'label':'Routing','status':f'{_count(RoutingRule)} rules','level':'success' if RoutingRule else 'warning'},
        {'label':'Validation','status':f'{_count(ValidationRule)} rules','level':'success' if ValidationRule else 'warning'},
        {'label':'Audit','status':f'{_count(Audit)} events','level':'success' if Audit else 'warning'},
        {'label':'Requests','status':f'{open_requests} open','level':'warning' if open_requests else 'success'},
    ]
    health_score=round(sum(100 if x['level']=='success' else 70 if x['level']=='warning' else 25 for x in health_checks)/len(health_checks),1)

    return {
        'metrics':{'published_forms':_count(Form,published_filter) if published_filter else _count(Form),'total_requests':total_requests,'open_requests':open_requests,'active_rules':_count(RoutingRule,active_rule_filter) if active_rule_filter else _count(RoutingRule),'validation_errors':rejected},
        'sla_compliance':sla_compliance,'sla_breached':rejected,'dashboard_health_score':health_score,'health_checks':health_checks,
        'routing_metrics':{'rules':_count(RoutingRule),'groups':_count(RuleGroup),'decisions':0,'exceptions':0},
        'validation_metrics':{'rules':_count(ValidationRule),'passed':completed,'warnings':0,'rejected':rejected},
        'audit_stats':audit_stats,'recent_changes':recent_changes,'status_chart':status_chart,'submissions_by_day':submissions_by_day,
        'sla_trend':[{'label':'Current','value':sla_compliance}],
        'lifecycle_funnel':[{'label':'Submitted','value':total_requests},{'label':'Open','value':open_requests},{'label':'Completed','value':completed},{'label':'Rejected','value':rejected}],
        'top_forms':top_forms,'top_form_max':max([x['submission_count'] for x in top_forms],default=1),'recent_submissions':recent_submissions,
        'top_aging_requests':[],'requests_near_breach':[],
    }


class DARDashboardContextMixin:
    dashboard_window_days=30
    def get_context_data(self, **kwargs):
        context=super().get_context_data(**kwargs)
        context.update(build_dar_dashboard_context(self.dashboard_window_days))
        return context
