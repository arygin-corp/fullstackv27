from django.db import models


class RoadmapPage(models.Model):
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Roadmap page"

    def __str__(self):
        return self.title


class RoadmapMilestone(models.Model):
    fiscal_start_year = models.PositiveIntegerField()
    quarter = models.PositiveSmallIntegerField()
    month_index = models.PositiveSmallIntegerField()
    month_name = models.CharField(max_length=20)
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("fiscal_start_year", "quarter", "position", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("fiscal_start_year", "month_index", "title"),
                name="roadmap_milestone_year_month_title",
            ),
        ]

    def __str__(self):
        return f"FY{self.fiscal_start_year} {self.title}"
