try:
 from locust import HttpUser,task,between
 class WorkflowUser(HttpUser):
  wait_time=between(.1,1)
  @task
  def list_inbox(self):self.client.get('/api/v4/inbox/',headers={'X-Tenant-Key':'load-test'})
except ImportError:
 WorkflowUser=None
