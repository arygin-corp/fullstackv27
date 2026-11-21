import importlib,pkgutil
class Registry:
    def __init__(self): self.items={};self.done=False
    def register(self,m): self.items.setdefault(m.key,m);return m
    def get(self,k): return self.items[k]
    def all(self): return tuple(self.items.values())
    def autodiscover(self):
        p=importlib.import_module("apps.third_party_apis.modules")
        for x in pkgutil.iter_modules(p.__path__):
            if x.ispkg: importlib.import_module(f"apps.third_party_apis.modules.{x.name}.module")
        self.done=True
        return self.all()
registry=Registry()
