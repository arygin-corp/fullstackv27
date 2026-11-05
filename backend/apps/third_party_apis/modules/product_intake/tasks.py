from datetime import timedelta
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from .models import IntakeSecurityEvent, NotificationOutbox, ProductIntake

@shared_task
def process_notification_outbox(limit=50):
    processed=0
    while processed<limit:
        with transaction.atomic():
            item=NotificationOutbox.objects.select_for_update(skip_locked=True).filter(status__in=["pending","failed"],next_attempt_at__lte=timezone.now()).order_by("created_at").first()
            if not item: break
            item.status="processing"; item.attempt_count+=1; item.save(update_fields=["status","attempt_count","updated_at"])
        try:
            intake=ProductIntake.objects.get(pk=item.payload["intake_id"])
            context={"intake":intake}
            text=render_to_string(f"intake/emails/{item.template_name}.txt",context)
            html=render_to_string(f"intake/emails/{item.template_name}.html",context)
            message=EmailMultiAlternatives(subject=f"Product Intake #{intake.pk}: {intake.product_name}",body=text,from_email=settings.DEFAULT_FROM_EMAIL,to=[item.recipient])
            message.attach_alternative(html,"text/html"); message.send(fail_silently=False)
            item.status="delivered"; item.delivered_at=timezone.now(); item.last_error=""
        except Exception as exc:
            item.status="failed"; item.last_error=str(exc)[:2000]; item.next_attempt_at=timezone.now()+timedelta(minutes=min(60,2**min(item.attempt_count,5)))
            IntakeSecurityEvent.objects.create(event_type="notification_failure",outcome="failed",intake=item.intake,details={"outbox_id":item.pk,"error":item.last_error})
        item.save(); processed+=1
    return processed
