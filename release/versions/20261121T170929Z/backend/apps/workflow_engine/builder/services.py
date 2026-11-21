class BuilderService:
 REQUIRED=('workflow','states','transitions','roles')
 @staticmethod
 def validate_blueprint(blueprint):
  errors=[]
  for key in BuilderService.REQUIRED:
   if not blueprint.get(key):errors.append(f'Missing {key}')
  states={s.get('key') for s in blueprint.get('states',[])}
  for t in blueprint.get('transitions',[]):
   if t.get('source') not in states or t.get('target') not in states:errors.append(f'Invalid transition endpoint: {t.get("key")}')
  return errors
 @staticmethod
 def readiness(project):
  checklist=project.checklist;checks={name:getattr(checklist,name) for name in ('forms_ready','rules_ready','roles_ready','sla_ready','tests_passed','security_reviewed','publish_approved')};return {'ready':all(checks.values()) and not BuilderService.validate_blueprint(project.blueprint),'checks':checks,'errors':BuilderService.validate_blueprint(project.blueprint)}
