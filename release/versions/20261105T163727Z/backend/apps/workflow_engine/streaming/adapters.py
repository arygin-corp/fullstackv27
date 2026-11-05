class StreamAdapter:
 def publish(self,connection,topic,key,payload,headers):raise NotImplementedError
 def consume(self,subscription,handler):raise NotImplementedError
class StreamRegistry:
 adapters={}
 @classmethod
 def register(cls,provider,adapter):cls.adapters[provider]=adapter
 @classmethod
 def publish(cls,publication):
  adapter=cls.adapters.get(publication.connection.provider)
  if not adapter:raise LookupError('Stream adapter not configured.')
  return adapter.publish(publication.connection,publication.topic,publication.key,publication.payload,publication.headers)
