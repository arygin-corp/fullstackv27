import base64
import hashlib
import json
from urllib.request import Request, urlopen
from django.conf import settings
from django.utils import timezone
from notifications.models import PushDevice, PushProvider
from notifications.monitoring.metrics import inc

class PushDisabled(RuntimeError): pass
class PushProviderError(RuntimeError): pass

def _keyring():
    import os
    from cryptography.fernet import Fernet
    keys={}
    if settings.PUSH_ENCRYPTION_KEYS:
        for item in settings.PUSH_ENCRYPTION_KEYS.split(","):
            if ":" not in item: continue
            key_id,key=item.split(":",1); keys[key_id.strip()]=Fernet(key.strip().encode())
    if not keys:
        key=hashlib.sha256(settings.SECRET_KEY.encode()).digest(); keys["default"]=Fernet(base64.urlsafe_b64encode(key))
    return keys
def encrypt_token(token):
    keys=_keyring(); key_id=settings.PUSH_ENCRYPTION_ACTIVE_KEY_ID
    if key_id not in keys: raise RuntimeError("Active push encryption key is not configured")
    return f"{key_id}:{keys[key_id].encrypt(token.encode()).decode()}"
def decrypt_token(value):
    keys=_keyring()
    if ":" in value:
        key_id,ciphertext=value.split(":",1)
        if key_id in keys: return keys[key_id].decrypt(ciphertext.encode()).decode()
    for fernet in keys.values():
        try: return fernet.decrypt(value.encode()).decode()
        except Exception: continue
    raise RuntimeError("Push token cannot be decrypted with configured keys")
def token_digest(token): return hashlib.sha256(token.encode()).hexdigest()

def register_device(*, user, provider, platform, device_identifier, token, application_identifier="notification-app", locale="en-US", time_zone="UTC", metadata=None):
    if not settings.MOBILE_PUSH_ENABLED: raise PushDisabled("Mobile push is disabled")
    device,_=PushDevice.objects.update_or_create(user=user,provider=provider,device_identifier=device_identifier,application_identifier=application_identifier,defaults={"platform":platform,"token_encrypted":encrypt_token(token),"token_digest":token_digest(token),"locale":locale,"time_zone":time_zone,"metadata":metadata or {},"is_active":True,"disabled_at":None,"failure_count":0,"last_seen_at":timezone.now()})
    return device

def push_payload(notification):
    payload={"notification_id":notification.pk,"type":notification.notification_type,"title":notification.title,"url":notification.url}
    if settings.MOBILE_PUSH_INCLUDE_BODY: payload["body"]=notification.body
    else: payload["body"]="Open the app to view this notification."
    return payload

def _post_json(url,payload,headers,timeout):
    request=Request(url,data=json.dumps(payload).encode(),headers={"Content-Type":"application/json",**headers},method="POST")
    with urlopen(request,timeout=timeout) as response:
        return response.status,response.read().decode()[:500]

def send_push(device, notification):
    if not settings.MOBILE_PUSH_ENABLED: raise PushDisabled("Mobile push is disabled")
    token=decrypt_token(device.token_encrypted); payload=push_payload(notification)
    if device.provider==PushProvider.WEB_PUSH:
        if not settings.WEB_PUSH_ENABLED: raise PushDisabled("Web push is disabled")
        try:
            from pywebpush import webpush
            subscription={"endpoint":device.metadata["endpoint"],"keys":{"p256dh":device.metadata["p256dh"],"auth":device.metadata["auth"]}}
            result=webpush(subscription_info=subscription,data=json.dumps(payload),vapid_private_key=settings.WEB_PUSH_VAPID_PRIVATE_KEY,vapid_claims={"sub":settings.WEB_PUSH_VAPID_SUBJECT})
            return True,str(getattr(result,"status_code","accepted")),""
        except Exception as exc: raise PushProviderError(str(exc)) from exc
    endpoint=settings.FCM_PUSH_ENDPOINT if device.provider==PushProvider.FCM else settings.APNS_PUSH_ENDPOINT
    enabled=settings.FCM_PUSH_ENABLED if device.provider==PushProvider.FCM else settings.APNS_PUSH_ENABLED
    credential=settings.FCM_PUSH_BEARER_TOKEN if device.provider==PushProvider.FCM else settings.APNS_PUSH_BEARER_TOKEN
    if not enabled: raise PushDisabled(f"{device.provider} is disabled")
    if not endpoint or not credential: raise PushProviderError(f"{device.provider} provider is not configured")
    body={"token":token,"message":payload,"application_identifier":device.application_identifier}
    status,response=_post_json(endpoint,body,{"Authorization":f"Bearer {credential}"},settings.MOBILE_PUSH_TIMEOUT_SECONDS)
    if status not in (200,201,202): raise PushProviderError(f"Provider returned {status}")
    return True,str(status),response
