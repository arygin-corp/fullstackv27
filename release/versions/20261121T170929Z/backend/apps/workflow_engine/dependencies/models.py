from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
class DependencyNode(TimeStampedModel):kind=models.CharField(max_length=80);key=models.CharField(max_length=180);version=models.CharField(max_length=60,blank=True);metadata=models.JSONField(default=dict)
class DependencyEdge(TimeStampedModel):
    source=models.ForeignKey(DependencyNode,related_name='dependencies',on_delete=models.CASCADE)
    target=models.ForeignKey(DependencyNode,related_name='dependents',on_delete=models.CASCADE)
    relationship=models.CharField(max_length=80,default='depends_on')
    required=models.BooleanField(default=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=('source','target','relationship'),name='uq_dependency_edge')]
class WorkflowDependency(TimeStampedModel):workflow=models.ForeignKey(WorkflowDefinition,related_name='declared_dependencies',on_delete=models.CASCADE);node=models.ForeignKey(DependencyNode,on_delete=models.CASCADE);usage=models.CharField(max_length=80);configuration=models.JSONField(default=dict)
