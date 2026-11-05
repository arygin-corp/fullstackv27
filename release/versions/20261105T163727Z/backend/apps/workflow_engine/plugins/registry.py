class PluginRegistry:
 _handlers={}
 @classmethod
 def register(cls,plugin_key,action_key,handler):cls._handlers[(plugin_key,action_key)]=handler
 @classmethod
 def execute(cls,plugin_key,action_key,**kwargs):
  handler=cls._handlers.get((plugin_key,action_key))
  if not handler:raise LookupError('Plugin action is not registered')
  return handler(**kwargs)
