from django.db import models
from ..models import TimeStampedModel
class APIProduct(TimeStampedModel):name=models.CharField(max_length=180);key=models.SlugField(unique=True);version=models.CharField(max_length=40);openapi=models.JSONField(default=dict);status=models.CharField(max_length=30,default='draft');audience=models.CharField(max_length=50,default='internal')
class SDKRelease(TimeStampedModel):language=models.CharField(max_length=40);version=models.CharField(max_length=40);artifact_reference=models.CharField(max_length=255);checksum=models.CharField(max_length=64);status=models.CharField(max_length=30,default='draft');compatibility=models.JSONField(default=dict)
class DeveloperApplication(TimeStampedModel):name=models.CharField(max_length=180);owner=models.CharField(max_length=180);client_id=models.CharField(max_length=160,unique=True);scopes=models.JSONField(default=list);status=models.CharField(max_length=30,default='pending');rate_limit=models.PositiveIntegerField(default=60)
