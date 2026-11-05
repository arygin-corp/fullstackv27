class CertificationService:
 @staticmethod
 def evaluate(review):
  required=review.profile.requirements;provided=review.evidence;missing=[r for r in required if not provided.get(r.get('key'))];return {'passed':not missing,'missing':missing,'findings':review.findings}
