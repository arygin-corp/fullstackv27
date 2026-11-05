from django.db import transaction
from django.db.models import Max
from ..platform_models import ProcessEvent,ProcessSnapshot
class EventStore:
 @staticmethod
 @transaction.atomic
 def append(stream_id,event_type,data,metadata=None,expected_sequence=None,tenant_key=''):
  latest=ProcessEvent.objects.filter(stream_id=stream_id).aggregate(v=Max('sequence'))['v'] or 0
  if expected_sequence is not None and latest!=expected_sequence: raise RuntimeError('Concurrency conflict')
  return ProcessEvent.objects.create(stream_id=stream_id,sequence=latest+1,event_type=event_type,data=data,metadata=metadata or {},tenant_key=tenant_key)
 @staticmethod
 def replay(stream_id,reducer,initial=None):
  state=initial or {}
  for event in ProcessEvent.objects.filter(stream_id=stream_id): state=reducer(state,event)
  return state
 @staticmethod
 def snapshot(stream_id,sequence,state): return ProcessSnapshot.objects.create(stream_id=stream_id,sequence=sequence,state=state)
