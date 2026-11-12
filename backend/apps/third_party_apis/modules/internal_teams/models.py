from django.db import models


class TeamPage(models.Model):
    title = models.CharField(max_length=150, unique=True)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Team page"

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    name = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=150)
    image = models.CharField(max_length=255, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.name
