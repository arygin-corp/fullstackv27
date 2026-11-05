from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Tenant(models.Model):
    name = models.CharField(max_length=255)

class Team(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="teams", )
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='teams/icons/', blank=True, null=True)
    logo = models.ImageField(upload_to='teams/logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='teams/covers/', blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_teams')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class TeamMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,)
    team = models.ForeignKey(Team, on_delete=models.CASCADE,)
    is_active = models.BooleanField(default=True)