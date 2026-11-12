from django.contrib import admin

from .models import RoadmapMilestone, RoadmapPage


@admin.register(RoadmapPage)
class RoadmapPageAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active")


@admin.register(RoadmapMilestone)
class RoadmapMilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "fiscal_start_year", "quarter", "month_name", "is_active")
    list_filter = ("fiscal_start_year", "quarter", "is_active")
