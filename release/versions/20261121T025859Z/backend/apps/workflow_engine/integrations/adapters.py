import hashlib,hmac,json
from urllib.request import Request,urlopen
class WebhookAdapter:
    def send(self,subscription,event):
        body=json.dumps(event).encode(); signature=hmac.new(subscription.secret.encode(),body,hashlib.sha256).hexdigest()
        req=Request(subscription.url,data=body,headers={'Content-Type':'application/json','X-Workflow-Signature':signature},method='POST')
        with urlopen(req,timeout=10) as response: return response.status
class NotificationAdapter:
    def send(self,notification): raise NotImplementedError('Configure an email, Teams, SMS, or other delivery adapter.')
