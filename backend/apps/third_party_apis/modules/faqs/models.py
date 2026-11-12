from django.db import models


class FaqSection(models.Model):
    title = models.CharField(max_length=150)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.title


class Faq(models.Model):
    section = models.ForeignKey(FaqSection, on_delete=models.CASCADE, related_name="items")
    question = models.TextField()
    answer = models.JSONField(default=list)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("section", "position", "id")

    def __str__(self):
        return self.question
