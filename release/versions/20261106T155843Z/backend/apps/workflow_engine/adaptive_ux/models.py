from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
class ExperienceProfile(TimeStampedModel):user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE);persona=models.CharField(max_length=40,default='business');preferences=models.JSONField(default=dict);accessibility=models.JSONField(default=dict);onboarding_state=models.JSONField(default=dict)
class GuidedJourney(TimeStampedModel):name=models.CharField(max_length=180);key=models.SlugField(unique=True);persona=models.CharField(max_length=40);steps=models.JSONField(default=list);completion_criteria=models.JSONField(default=dict);active=models.BooleanField(default=True)
class UXExperiment(TimeStampedModel):name=models.CharField(max_length=180);key=models.SlugField(unique=True);variants=models.JSONField(default=list);allocation=models.JSONField(default=dict);success_metrics=models.JSONField(default=list);status=models.CharField(max_length=30,default='draft')
