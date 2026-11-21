import os
from abc import ABC,abstractmethod
class SecretProviderError(RuntimeError): pass
class SecretProvider(ABC):
    @abstractmethod
    def get(self,reference): raise NotImplementedError
class EnvironmentSecretProvider(SecretProvider):
    def get(self,reference):
        if not reference: raise SecretProviderError("Secret reference is empty")
        key=reference[4:] if reference.startswith("env:") else reference
        value=os.getenv(key,"")
        if not value: raise SecretProviderError(f"Secret is not configured: {key}")
        return value
def get_secret_provider(): return EnvironmentSecretProvider()
def resolve_secret(reference,legacy_value=""):
    if reference: return get_secret_provider().get(reference)
    if legacy_value: return legacy_value
    raise SecretProviderError("No secret reference is configured")
