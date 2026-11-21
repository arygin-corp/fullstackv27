from django.db import models

class SystemInfo(models.Model):
    environment = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.environment} - {self.version}"

class ProjectResource(models.Model):
    name = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
