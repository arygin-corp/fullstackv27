class ConnectorAdapter:
    def test_connection(self,installation):raise NotImplementedError
    def execute(self,installation,operation,payload):raise NotImplementedError
class ConnectorRuntime:
    adapters={}
    @classmethod
    def register(cls,key,adapter):cls.adapters[key]=adapter
    @classmethod
    def execute(cls,installation,operation,payload):
        key=installation.version.connector.key
        if key not in cls.adapters:raise LookupError('Connector adapter is not registered.')
        return cls.adapters[key].execute(installation,operation,payload)
