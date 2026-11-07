import threading
from collections import Counter
from django.db import DatabaseError
from apps.notifications.models import NotificationMetric
_lock=threading.Lock(); _runtime=Counter(); _collectors={}
def _collector(name,labels,value,is_gauge=False):
    try:
        from prometheus_client import Counter as PCounter, Gauge
    except ImportError: return None
    labelnames=tuple(sorted((labels or {}).keys())); key=(name,labelnames,is_gauge)
    with _lock:
        metric=_collectors.get(key)
        if metric is None:
            if is_gauge: metric=Gauge(name,"Notification platform metric",labelnames,multiprocess_mode="livesum")
            else:
                base=name[:-6] if name.endswith("_total") else name
                metric=PCounter(base,"Notification platform metric",labelnames)
            _collectors[key]=metric
    return metric.labels(**{k:str((labels or {})[k]) for k in labelnames}) if labelnames else metric
def inc(name,value=1,labels=None,persist=True):
    with _lock: _runtime[(name,tuple(sorted((labels or {}).items())))] += value
    metric=_collector(name,labels,value,False)
    if metric is not None: metric.inc(value)
    if persist:
        try: NotificationMetric.objects.create(name=name,value=value,labels=labels or {})
        except DatabaseError: pass
def set_gauge(name,value,labels=None):
    with _lock: _runtime[(name,tuple(sorted((labels or {}).items())))] = value
    metric=_collector(name,labels,value,True)
    if metric is not None: metric.set(value)
def snapshot():
    with _lock:
        out={}
        for (name,labels),value in _runtime.items():
            key=name if not labels else name+"{"+",".join(f'{k}="{v}"' for k,v in labels)+"}"
            out[key]=value
        return out
def prometheus_payload():
    try:
        from prometheus_client import CollectorRegistry, CONTENT_TYPE_LATEST, generate_latest, multiprocess
        import os
        directory=os.getenv("PROMETHEUS_MULTIPROC_DIR")
        if directory:
            registry=CollectorRegistry(); multiprocess.MultiProcessCollector(registry); return generate_latest(registry),CONTENT_TYPE_LATEST
        return generate_latest(),CONTENT_TYPE_LATEST
    except Exception:
        lines=[]
        for name,value in sorted(snapshot().items()): lines.append(f"{name} {value}")
        return ("\n".join(lines)+"\n").encode(),"text/plain; version=0.0.4"
