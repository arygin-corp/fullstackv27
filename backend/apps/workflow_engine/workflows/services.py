import hashlib, hmac, json
from dataclasses import dataclass
from datetime import timedelta
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone
from django.utils.module_loading import import_string
from ..actions import ActionRegistry
from ..conditions import evaluate
from ..models import *

@dataclass(frozen=True)
class TransitionResult: instance: WorkflowInstance; event: TransitionEvent

class WorkflowEngine:
    @staticmethod
    @transaction.atomic
    def start(*,workflow,actor=None,context=None,external_id='',correlation_id=''):
        if workflow.lifecycle!=WorkflowDefinition.Lifecycle.PUBLISHED: raise ValidationError('Only published workflows can start.')
        initial=workflow.states.filter(is_initial=True).first()
        if not initial: raise ValidationError('Workflow has no initial state.')
        instance=WorkflowInstance.objects.create(workflow=workflow,current_state=initial,context=context or {},external_id=external_id,correlation_id=correlation_id,created_by=actor if getattr(actor,'is_authenticated',False) else None)
        WorkflowEngine._apply_sla(instance); WorkflowEngine._outbox('workflow.started',instance,{'state':initial.key})
        return instance

    @staticmethod
    def available_transitions(*,instance,actor=None,payload=None):
        qs=instance.workflow.transitions.filter(source=instance.current_state,is_active=True).select_related('source','target')
        return [t for t in qs if WorkflowEngine._allowed(t,instance,actor,payload or {},False)]

    @staticmethod
    @transaction.atomic
    def transition(*,instance,transition_key,actor=None,payload=None,request_meta=None):
        payload=payload or {}; request_meta=request_meta or {}
        locked=WorkflowInstance.objects.select_for_update().select_related('workflow','current_state').get(pk=instance.pk)
        if locked.status!=WorkflowInstance.Status.RUNNING: raise ValidationError('Instance is not running.')
        try: transition=WorkflowTransition.objects.select_related('source','target').get(workflow=locked.workflow,source=locked.current_state,key=transition_key,is_active=True)
        except WorkflowTransition.DoesNotExist as exc: raise ValidationError('Transition is unavailable from the current state.') from exc
        WorkflowEngine._allowed(transition,locked,actor,payload,True)
        before=dict(locked.context); locked.context={**before,**payload.get('context_patch',{})}; source=locked.current_state; locked.current_state=transition.target; locked.revision+=1
        if transition.target.is_terminal: locked.status=WorkflowInstance.Status.COMPLETED; locked.completed_at=timezone.now(); locked.due_at=None
        locked.save(update_fields=('current_state','context','revision','status','completed_at','due_at','updated_at'))
        event=TransitionEvent.objects.create(instance=locked,transition=transition,source_state=source,target_state=transition.target,actor=actor if getattr(actor,'is_authenticated',False) else None,payload=payload,context_before=before,context_after=locked.context,ip_address=request_meta.get('ip'),user_agent=request_meta.get('user_agent',''))
        if payload.get('signature_meaning') and getattr(actor,'is_authenticated',False):
            digest=hashlib.sha256(f'{locked.pk}:{event.pk}:{actor.pk}:{payload["signature_meaning"]}'.encode()).hexdigest()
            ElectronicSignature.objects.create(instance=locked,event=event,signed_by=actor,meaning=payload['signature_meaning'],signature_hash=digest)
        if transition.action_key: ActionRegistry.execute(transition.action_key,instance=locked,event=event,payload=payload)
        WorkflowEngine._apply_sla(locked); WorkflowEngine._outbox('workflow.transitioned',locked,{'transition':transition.key,'from':source.key,'to':transition.target.key}); return TransitionResult(locked,event)

    @staticmethod
    def _allowed(t,i,a,p,raise_errors):
        allowed=evaluate(t.condition,{'context':i.context,'payload':p})
        if t.required_permission: allowed=allowed and bool(a and a.has_perm(t.required_permission))
        if t.required_role:
            user_ids=set(i.assignments.filter(role=t.required_role,active=True).values_list('user_id',flat=True)); allowed=allowed and bool(a and a.pk in user_ids)
        if t.guard_path: allowed=allowed and bool(import_string(t.guard_path)(instance=i,actor=a,payload=p))
        if not allowed and raise_errors: raise PermissionDenied('Transition authorization or condition failed.')
        return allowed

    @staticmethod
    def _apply_sla(i):
        rule=i.workflow.sla_rules.filter(state=i.current_state).first()
        hours=rule.due_after_hours if rule else i.current_state.sla_hours
        i.due_at=timezone.now()+timedelta(hours=hours) if hours else None; i.save(update_fields=('due_at','updated_at'))

    @staticmethod
    def _outbox(topic,i,payload): OutboxEvent.objects.create(topic=topic,aggregate_id=str(i.pk),payload={'instance_id':i.pk,'workflow':i.workflow.key,**payload})

    @staticmethod
    @transaction.atomic
    def rollback(*,instance,event_id,actor=None):
        event=instance.events.get(pk=event_id); locked=WorkflowInstance.objects.select_for_update().get(pk=instance.pk)
        source=locked.current_state; locked.current_state=event.source_state; locked.status=WorkflowInstance.Status.RUNNING; locked.completed_at=None; locked.revision+=1; locked.save()
        audit=TransitionEvent.objects.create(instance=locked,source_state=source,target_state=event.source_state,actor=actor if getattr(actor,'is_authenticated',False) else None,event_type='rollback',payload={'rolled_back_event':event.pk},context_before=locked.context,context_after=locked.context)
        WorkflowEngine._outbox('workflow.rolled_back',locked,{'event_id':event.pk}); return TransitionResult(locked,audit)

class ApprovalService:
    @staticmethod
    @transaction.atomic
    def decide(*,task,actor,decision,comment=''):
        task=ApprovalTask.objects.select_for_update().select_related('instance','state').get(pk=task.pk)
        if task.status!=ApprovalTask.Status.PENDING: raise ValidationError('Task already decided.')
        if task.assigned_to_id not in (None,actor.pk): raise PermissionDenied('Task is assigned to another user.')
        task.status=decision; task.decision_comment=comment; task.decided_at=timezone.now(); task.save()
        pending=task.instance.approval_tasks.filter(state=task.state,status=ApprovalTask.Status.PENDING).count(); approved=task.instance.approval_tasks.filter(state=task.state,status=ApprovalTask.Status.APPROVED).count(); total=task.instance.approval_tasks.filter(state=task.state).count()
        complete=(task.state.join_mode=='all' and pending==0 and approved==total) or (task.state.join_mode=='any' and approved>0) or (task.state.join_mode=='majority' and approved>total/2)
        return {'complete':complete,'approved':approved,'total':total,'pending':pending}

class DefinitionService:
    @staticmethod
    @transaction.atomic
    def publish(workflow):
        errors=WorkflowValidator.validate(workflow)
        if errors: raise ValidationError(errors)
        workflow.lifecycle=WorkflowDefinition.Lifecycle.PUBLISHED; workflow.published_at=timezone.now(); workflow.save(); return workflow

class WorkflowValidator:
    @staticmethod
    def validate(w):
        states=list(w.states.all()); transitions=list(w.transitions.all()); errors=[]
        initials=[s for s in states if s.is_initial]; terminals=[s for s in states if s.is_terminal]
        if len(initials)!=1: errors.append('Exactly one initial state is required.')
        if not terminals: errors.append('At least one terminal state is required.')
        if initials:
            reachable={initials[0].id}; changed=True
            while changed:
                changed=False
                for t in transitions:
                    if t.source_id in reachable and t.target_id not in reachable: reachable.add(t.target_id); changed=True
            for s in states:
                if s.id not in reachable: errors.append(f'Unreachable state: {s.key}')
        for s in states:
            if not s.is_terminal and not any(t.source_id==s.id for t in transitions): errors.append(f'Dead-end nonterminal state: {s.key}')
        return errors

class ExportService:
    @staticmethod
    def export(w):
        return {'schema_version':1,'workflow':{'name':w.name,'key':w.key,'version':w.version,'description':w.description,'settings':w.settings},'states':[{'key':s.key,'name':s.name,'is_initial':s.is_initial,'is_terminal':s.is_terminal,'is_parallel':s.is_parallel,'join_mode':s.join_mode,'sla_hours':s.sla_hours,'metadata':s.metadata} for s in w.states.all()],'transitions':[{'key':t.key,'name':t.name,'source':t.source.key,'target':t.target.key,'condition':t.condition,'required_permission':t.required_permission,'required_role':t.required_role,'priority':t.priority,'action_key':t.action_key,'metadata':t.metadata} for t in w.transitions.select_related('source','target')]}

class MetricsService:
    @staticmethod
    def summary(workflow=None):
        qs=WorkflowInstance.objects.all();
        if workflow: qs=qs.filter(workflow=workflow)
        completed=qs.filter(status='completed'); durations=[(x.completed_at-x.created_at).total_seconds() for x in completed if x.completed_at]
        return {'active':qs.filter(status='running').count(),'completed':completed.count(),'overdue':qs.filter(status='running',due_at__lt=timezone.now()).count(),'average_completion_seconds':sum(durations)/len(durations) if durations else None}
