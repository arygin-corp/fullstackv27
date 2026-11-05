from django.db import transaction
class OperationsService:
 handlers={}
 @classmethod
 def register(cls,kind,handler):cls.handlers[kind]=handler
 @classmethod
 @transaction.atomic
 def execute(cls,command):
    if command.kind not in cls.handlers:raise LookupError('Operational command is not registered.')
    if not command.approved_by_id:raise PermissionError('Operational command requires approval.')
    command.status='running';command.save()
    try:command.result=cls.handlers[command.kind](command);command.status='completed';command.save();return command
    except Exception as exc:command.status='failed';command.error=str(exc);command.save();raise
