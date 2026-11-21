from django.utils.module_loading import import_string
class ActionRegistry:
    _actions={}
    @classmethod
    def register(cls,key,callable_or_path): cls._actions[key]=callable_or_path
    @classmethod
    def execute(cls,key,**kwargs):
        action=cls._actions.get(key)
        if not action: return None
        if isinstance(action,str): action=import_string(action)
        return action(**kwargs)
