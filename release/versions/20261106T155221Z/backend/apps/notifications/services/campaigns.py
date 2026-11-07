import hashlib
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from notifications.models import AudienceType, CampaignRecipient, CampaignStatus, DeliveryStatus, NotificationCampaign
from notifications.services.notifications import NotificationService
from notifications.services.templates import render_template
from notifications.services.audiences import create_snapshot

class CampaignService:
    @staticmethod
    def audience(campaign):
        User=get_user_model(); qs=User.objects.filter(is_active=True)
        if campaign.dynamic_audience_id:
            snapshot=getattr(campaign,"audience_snapshot",None) or create_snapshot(campaign.dynamic_audience,campaign=campaign,actor=campaign.created_by)
            return qs.filter(pk__in=snapshot.members.values("user_id"))
        if campaign.audience_type==AudienceType.ALL: return qs
        if campaign.audience_type==AudienceType.STAFF: return qs.filter(is_staff=True)
        if campaign.audience_type==AudienceType.USERS: return qs.filter(pk__in=campaign.audience_users.values("pk"))
        return qs.filter(groups__in=campaign.audience_groups.all()).distinct()
    @staticmethod
    def request_approval(campaign):
        if campaign.status!=CampaignStatus.DRAFT: raise ValueError("Only draft campaigns may request approval.")
        campaign.status=CampaignStatus.PENDING_APPROVAL; campaign.save(update_fields=["status","updated_at"]); return campaign
    @staticmethod
    def approve(campaign, approver):
        if campaign.status!=CampaignStatus.PENDING_APPROVAL: raise ValueError("Campaign is not pending approval.")
        if campaign.created_by_id==approver.pk: raise ValueError("Campaign approval requires a second person.")
        campaign.approved_by=approver; campaign.approved_at=timezone.now(); campaign.status=CampaignStatus.SCHEDULED if campaign.scheduled_at and campaign.scheduled_at>timezone.now() else CampaignStatus.APPROVED
        campaign.full_clean(); campaign.save(); return campaign
    @staticmethod
    def materialize_recipients(campaign):
        created=0
        for user in CampaignService.audience(campaign).iterator():
            variant="B" if campaign.variant=="AB" and int(hashlib.sha256(f"{campaign.pk}:{user.pk}".encode()).hexdigest(),16)%2 else "A"
            _,was_created=CampaignRecipient.objects.get_or_create(campaign=campaign,user=user,defaults={"variant":variant})
            created+=int(was_created)
        return created
    @staticmethod
    def send(campaign):
        now=timezone.now()
        if campaign.status not in {CampaignStatus.APPROVED,CampaignStatus.SCHEDULED,CampaignStatus.SENDING}: raise ValueError("Campaign must be approved before sending.")
        if campaign.scheduled_at and campaign.scheduled_at>now: return 0
        if campaign.expires_at and campaign.expires_at<=now:
            campaign.status=CampaignStatus.CANCELLED; campaign.failure_summary="Campaign expired before send."; campaign.save(update_fields=["status","failure_summary","updated_at"]); return 0
        campaign.status=CampaignStatus.SENDING; campaign.save(update_fields=["status","updated_at"])
        CampaignService.materialize_recipients(campaign); sent=0
        for recipient in campaign.recipients.select_related("user").filter(status=DeliveryStatus.PENDING):
            context={**campaign.context,"username":recipient.user.get_username(),"email":recipient.user.email,"campaign_name":campaign.name,"variant":recipient.variant}
            try:
                rendered=render_template(campaign.template_version,context)
                notification,created=NotificationService.create(recipient=recipient.user,title=rendered["title"],body=rendered["body"],url=rendered["url"],notification_type=campaign.notification_type,source="campaign",source_object_type="NotificationCampaign",source_object_id=str(campaign.pk),actor=campaign.created_by,idempotency_key=f"campaign:{campaign.pk}:user:{recipient.user_id}")
                recipient.notification=notification; recipient.status=DeliveryStatus.QUEUED if notification else DeliveryStatus.SUPPRESSED; recipient.save(update_fields=["notification","status","updated_at"]); sent+=int(created)
            except Exception as exc:
                recipient.status=DeliveryStatus.FAILED; recipient.error_summary=str(exc)[:500]; recipient.save(update_fields=["status","error_summary","updated_at"])
        if campaign.recipients.filter(status=DeliveryStatus.FAILED).exists(): campaign.status=CampaignStatus.FAILED
        else: campaign.status=CampaignStatus.SENT; campaign.sent_at=timezone.now()
        campaign.save(update_fields=["status","sent_at","updated_at"]); return sent
