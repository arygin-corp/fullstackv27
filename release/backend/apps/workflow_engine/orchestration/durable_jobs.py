import random
from datetime import timedelta
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from ..security_models import DeadLetter,DurableJob
class DurableJobQueue:
 @staticmethod
 @transaction.atomic
 def enqueue(*,kind,payload,idempotency_key,tenant=None,available_at=None,max_attempts=8):
  job,_=DurableJob.objects.get_or_create(idempotency_key=idempotency_key,defaults={'kind':kind,'payload':payload,'tenant':tenant,'available_at':available_at or timezone.now(),'max_attempts':max_attempts});return job
 @staticmethod
 @transaction.atomic
 def lease(*,worker,seconds=60,kinds=None):
  now=timezone.now();q=DurableJob.objects.select_for_update(skip_locked=True).filter(status__in=('pending','retry'),available_at__lte=now).filter(Q(locked_until__isnull=True)|Q(locked_until__lt=now))
  if kinds:q=q.filter(kind__in=kinds)
  job=q.order_by('available_at','pk').first()
  if not job:return None
  job.status='running';job.locked_by=worker;job.locked_until=now+timedelta(seconds=seconds);job.attempts+=1;job.save();return job
 @staticmethod
 @transaction.atomic
 def succeed(job):job.status='succeeded';job.locked_until=None;job.save()
 @staticmethod
 @transaction.atomic
 def fail(job,error):
  job.last_error=str(error);job.locked_until=None
  if job.attempts>=job.max_attempts:
   job.status='dead';job.save();DeadLetter.objects.get_or_create(job=job,defaults={'reason':str(error),'payload':job.payload});return
  delay=min(3600,2**job.attempts)+random.randint(0,10);job.status='retry';job.available_at=timezone.now()+timedelta(seconds=delay);job.save()
