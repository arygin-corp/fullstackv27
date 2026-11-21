class HealingActionRegistry:
 actions={}
 @classmethod
 def register(cls,key,handler):cls.actions[key]=handler
 @classmethod
 def execute(cls,key,context):
  if key not in cls.actions:raise LookupError('Healing action not registered.')
  return cls.actions[key](context)
