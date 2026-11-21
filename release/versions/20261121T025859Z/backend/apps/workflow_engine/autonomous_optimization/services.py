class OptimizationService:
 @staticmethod
 def can_apply(proposal):
  policy=proposal.policy
  return policy.enabled and proposal.status=='approved' and proposal.kind in policy.allowed_actions and (not proposal.simulation_required or bool(proposal.expected_impact))
