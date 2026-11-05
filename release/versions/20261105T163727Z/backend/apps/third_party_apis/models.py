from django.conf import settings
from django.db import models
class InstalledThirdPartyApi(models.Model):
    module_key = models.SlugField(
        max_length=100,
        unique=True,
        editable=False,
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    icon_image = models.ImageField(
        upload_to="third_party_apis/icons/",
        blank=True,
        null=True,
    )

    source_name = models.CharField(
        max_length=200,
        blank=True,
    )

    source_logo = models.ImageField(
        upload_to="third_party_apis/source_logos/",
        blank=True,
        null=True,
    )

    enabled = models.BooleanField(default=False)

    config = models.JSONField(
        default=dict,
        blank=True,
    )

    last_success_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("name",)
        permissions = (
            (
                "view_sensitive_suggestions",
                "Can view sensitive SuggestedAI results",
            ),
        )
class IntegrationTestRun(models.Model):
    module=models.ForeignKey(InstalledThirdPartyApi,on_delete=models.CASCADE,related_name="test_runs");triggered_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.SET_NULL);started_at=models.DateTimeField(auto_now_add=True);completed_at=models.DateTimeField(null=True,blank=True);status=models.CharField(max_length=32,default="incomplete")
class IntegrationTestCheck(models.Model):
    run=models.ForeignKey(IntegrationTestRun,on_delete=models.CASCADE,related_name="checks");key=models.CharField(max_length=100);name=models.CharField(max_length=200);category=models.CharField(max_length=100);status=models.CharField(max_length=20);message=models.TextField();remediation=models.TextField(blank=True);duration_ms=models.PositiveIntegerField(null=True,blank=True)
class IntegrationAuditLog(models.Model):
    module=models.ForeignKey(InstalledThirdPartyApi,on_delete=models.CASCADE,related_name="audit_logs");action=models.CharField(max_length=20);result=models.CharField(max_length=20);actor=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.SET_NULL);request_method=models.CharField(max_length=12,blank=True);request_path=models.CharField(max_length=500,blank=True);status_code=models.PositiveIntegerField(null=True,blank=True);duration_ms=models.PositiveIntegerField(null=True,blank=True);message=models.CharField(max_length=500,blank=True);changes=models.JSONField(default=dict,blank=True);metadata=models.JSONField(default=dict,blank=True);created_at=models.DateTimeField(auto_now_add=True)
class IntegrationDailyMetric(models.Model):
    module=models.ForeignKey(InstalledThirdPartyApi,on_delete=models.CASCADE,related_name="daily_metrics");date=models.DateField();request_count=models.PositiveIntegerField(default=0);success_count=models.PositiveIntegerField(default=0);failure_count=models.PositiveIntegerField(default=0);warning_count=models.PositiveIntegerField(default=0);total_duration_ms=models.PositiveBigIntegerField(default=0);max_duration_ms=models.PositiveIntegerField(default=0)
