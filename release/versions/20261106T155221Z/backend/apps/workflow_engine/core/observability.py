import logging,time,uuid
logger=logging.getLogger('workflow_engine')
class workflow_span:
 def __init__(self,name,**attrs):self.name=name;self.attrs=attrs
 def __enter__(self):self.started=time.monotonic();self.trace_id=str(uuid.uuid4());logger.info('span.start',extra={'span':self.name,'trace_id':self.trace_id,**self.attrs});return self
 def __exit__(self,exc_type,exc,tb):logger.info('span.end',extra={'span':self.name,'trace_id':self.trace_id,'duration_ms':(time.monotonic()-self.started)*1000,'error':str(exc) if exc else ''})
