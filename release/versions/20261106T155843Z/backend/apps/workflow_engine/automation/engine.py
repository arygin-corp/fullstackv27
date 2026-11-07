from collections import defaultdict,deque
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from ..core.conditions import evaluate
from .models import FlowExecution,NodeExecution
class NodeHandlerRegistry:
    handlers={}
    @classmethod
    def register(cls,kind,handler):cls.handlers[kind]=handler
    @classmethod
    def execute(cls,node,payload,context):
        if node.kind not in cls.handlers:raise LookupError(f'No handler for {node.kind}')
        return cls.handlers[node.kind](node=node,payload=payload,context=context)
class AutomationEngine:
    @staticmethod
    def validate(flow):
        ids={n.node_id for n in flow.nodes.all()};errors=[]
        if not any(n.kind=='trigger' for n in flow.nodes.all()):errors.append('At least one trigger node is required.')
        for edge in flow.edges.all():
            if edge.source not in ids or edge.target not in ids:errors.append(f'Invalid edge {edge.source}->{edge.target}')
        return errors
    @staticmethod
    @transaction.atomic
    def start(flow,payload,idempotency_key):
        found=FlowExecution.objects.filter(flow=flow,idempotency_key=idempotency_key).first()
        if found:return found
        errors=AutomationEngine.validate(flow)
        if errors:raise ValidationError(errors)
        starts=list(flow.nodes.filter(kind='trigger').values_list('node_id',flat=True));return FlowExecution.objects.create(flow=flow,status='running',trigger_payload=payload,context={'trigger':payload},current_nodes=starts,idempotency_key=idempotency_key,started_at=timezone.now())
    @staticmethod
    @transaction.atomic
    def step(execution,node_id):
        execution=FlowExecution.objects.select_for_update().get(pk=execution.pk);node=execution.flow.nodes.get(node_id=node_id);run=NodeExecution.objects.create(execution=execution,node_id=node_id,status='running',input=execution.context,started_at=timezone.now())
        try:
            output=NodeHandlerRegistry.execute(node,execution.trigger_payload,execution.context) or {};run.output=output;run.status='completed';run.completed_at=timezone.now();run.save();execution.context={**execution.context,node_id:output}
            targets=[e.target for e in execution.flow.edges.filter(source=node_id).order_by('position') if evaluate(e.condition,{'context':execution.context,'payload':output})]
            execution.current_nodes=targets
            if not targets:execution.status='completed';execution.completed_at=timezone.now()
            execution.save();return execution
        except Exception as exc:run.status='failed';run.error=str(exc);run.completed_at=timezone.now();run.save();execution.status='failed';execution.error=str(exc);execution.save();raise
