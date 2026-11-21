from abc import ABC
from dataclasses import dataclass
@dataclass(frozen=True)
class AdapterHealthResult:status:str;message:str;metadata:dict
class BaseAWSServiceAdapter(ABC):
    service_key="";supported_operations=frozenset()
    def list_resources(self,**kwargs):raise NotImplementedError(f"{self.service_key} does not implement list_resources")
    def test_connection(self,**kwargs):raise NotImplementedError(f"{self.service_key} does not implement test_connection")
    def health_check(self,**kwargs):return AdapterHealthResult("unknown","No service-specific health check is implemented.",{})
