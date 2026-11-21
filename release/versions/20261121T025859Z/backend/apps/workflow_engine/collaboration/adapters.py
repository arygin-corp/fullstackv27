class CollaborationAdapter:
 def send_card(self,channel,payload):raise NotImplementedError
 def update_card(self,channel,message_id,payload):raise NotImplementedError
 def verify_action(self,request):raise NotImplementedError
class CollaborationService:
 adapters={}
 @classmethod
 def register(cls,provider,adapter):cls.adapters[provider]=adapter
 @classmethod
 def send(cls,card):
  adapter=cls.adapters.get(card.channel.provider)
  if not adapter:raise LookupError('Collaboration adapter is not configured.')
  card.external_message_id=adapter.send_card(card.channel,card.payload);card.status='sent';card.save();return card
