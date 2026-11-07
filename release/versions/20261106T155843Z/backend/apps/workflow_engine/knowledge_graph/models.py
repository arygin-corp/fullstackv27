from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class GraphNode(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);node_type=models.CharField(max_length=80,db_index=True);external_key=models.CharField(max_length=255);label=models.CharField(max_length=255);properties=models.JSONField(default=dict)
class GraphEdge(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);source=models.ForeignKey(GraphNode,related_name='outgoing_edges',on_delete=models.CASCADE);target=models.ForeignKey(GraphNode,related_name='incoming_edges',on_delete=models.CASCADE);relationship=models.CharField(max_length=100,db_index=True);properties=models.JSONField(default=dict)
class Meta:constraints=[models.UniqueConstraint(fields=('tenant','source','target','relationship'),name='uq_graph_edge')]
