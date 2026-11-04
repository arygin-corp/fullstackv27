from django.conf import settings
from django.core.mail import send_mail
from .models import NotificationDelivery,NotificationPreference
def notify(user,subject,body,action_url=""):
    pref,_=NotificationPreference.objects.get_or_create(user=user);results=[]
    if pref.in_app_enabled: results.append(NotificationDelivery.objects.create(recipient=user,channel="in-app",status="sent",subject=subject,body_text=body,action_url=action_url))
    if pref.email_enabled and user.email:
        row=NotificationDelivery.objects.create(recipient=user,channel="email",subject=subject,body_text=body,action_url=action_url)
        try: send_mail(subject,body,getattr(settings,"DEFAULT_FROM_EMAIL",None),[user.email]);row.status="sent"
        except Exception as exc: row.status="failed";row.payload={"error":str(exc)}
        row.save();results.append(row)
    return results
