from django.contrib import admin

from .models import CampaignAd


@admin.register(CampaignAd)
class CampaignAdAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "position", "is_active")
    list_filter = ("kind", "is_active")
