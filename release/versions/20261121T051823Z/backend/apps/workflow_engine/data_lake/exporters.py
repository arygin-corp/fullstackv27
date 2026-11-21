class LakeExporter:
 def export(self,job,records):raise NotImplementedError
class ExportService:
 @staticmethod
 def run(job,exporter,records):
  job.status='running';job.save()
  try:job.row_count=exporter.export(job,records);job.status='completed';job.save();return job
  except Exception as exc:job.status='failed';job.error=str(exc);job.save();raise
