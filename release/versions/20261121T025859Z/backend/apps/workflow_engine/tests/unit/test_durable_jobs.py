from django.test import TestCase
from workflow_engine.durable import DurableJobQueue
class DurableQueueTests(TestCase):
 def test_enqueue_is_idempotent(self):
  a=DurableJobQueue.enqueue(kind='notify',payload={},idempotency_key='x');b=DurableJobQueue.enqueue(kind='notify',payload={},idempotency_key='x');self.assertEqual(a.pk,b.pk)
 def test_dead_letter_after_max_attempts(self):
  job=DurableJobQueue.enqueue(kind='notify',payload={},idempotency_key='d',max_attempts=1);job=DurableJobQueue.lease(worker='w');DurableJobQueue.fail(job,'bad');job.refresh_from_db();self.assertEqual(job.status,'dead')
