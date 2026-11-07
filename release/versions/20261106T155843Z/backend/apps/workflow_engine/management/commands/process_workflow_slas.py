from django.core.management.base import BaseCommand
from apps.workflow_engine.tasks import process_slas

class Command(BaseCommand):
  help='Process overdue workflow SLA records'
  def handle(self,*args,**kwargs):self.stdout.write(str(process_slas()))
