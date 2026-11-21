class UnknownAWSServiceAdapter(LookupError):pass
class AWSServiceAdapterRegistry:
    def __init__(self):self._adapters={}
    def register(self,adapter):
        if not adapter.service_key:raise ValueError("Adapter service_key is required")
        self._adapters[adapter.service_key]=adapter;return adapter
    def get(self,service_name):
        try:return self._adapters[service_name]
        except KeyError as exc:raise UnknownAWSServiceAdapter(f"No AWS adapter is registered for '{service_name}'.") from exc
    def all(self):return dict(self._adapters)
AWS_SERVICE_REGISTRY=AWSServiceAdapterRegistry()
def register_adapter(adapter):return AWS_SERVICE_REGISTRY.register(adapter)
def get_adapter(service_name):return AWS_SERVICE_REGISTRY.get(service_name)
