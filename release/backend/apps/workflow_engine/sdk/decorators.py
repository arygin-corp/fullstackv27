REGISTRY={'actions':{},'guards':{},'steps':{}}
def _register(kind,name=None):
 def deco(fn):REGISTRY[kind][name or fn.__name__]=fn;return fn
 return deco
def workflow_action(name=None):return _register('actions',name)
def workflow_guard(name=None):return _register('guards',name)
def workflow_step(name=None):return _register('steps',name)
