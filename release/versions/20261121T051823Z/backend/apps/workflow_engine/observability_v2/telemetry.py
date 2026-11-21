import contextlib,time,uuid
from decimal import Decimal
from .models import TelemetryEvent,MetricSample
@contextlib.contextmanager
def traced(operation,service='workflow-engine',tenant=None,attributes=None,parent_span_id=''):
    trace_id=uuid.uuid4().hex;span_id=uuid.uuid4().hex[:16];start=time.perf_counter();status='ok'
    try:yield {'trace_id':trace_id,'span_id':span_id}
    except Exception:status='error';raise
    finally:TelemetryEvent.objects.create(tenant=tenant,trace_id=trace_id,span_id=span_id,parent_span_id=parent_span_id,service=service,operation=operation,status=status,duration_ms=Decimal(str((time.perf_counter()-start)*1000)),attributes=attributes or {})
def metric(name,value,tenant=None,unit='',labels=None):return MetricSample.objects.create(tenant=tenant,name=name,value=value,unit=unit,labels=labels or {})
