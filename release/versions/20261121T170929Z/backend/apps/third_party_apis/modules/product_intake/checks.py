from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.checks import Error, register

@register()
def intake_manager_email_checks(app_configs,**kwargs):
    User=get_user_model(); errors=[]
    for email in getattr(settings,"INTAKE_MEMBERSHIP_MANAGER_EMAILS",set()):
        count=User.objects.filter(email__iexact=email,is_active=True).count()
        if count != 1: errors.append(Error(f"Membership manager email must match exactly one active user: {email}",id="intake.E001"))
    return errors
