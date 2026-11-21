from django.contrib import admin

from .models import WalkthroughChrome, WalkthroughStep


@admin.register(WalkthroughChrome)
class WalkthroughChromeAdmin(admin.ModelAdmin):
    list_display = ("layout",)


@admin.register(WalkthroughStep)
class WalkthroughStepAdmin(admin.ModelAdmin):
    list_display = ("title", "source_id", "position", "chrome_layout", "is_active")
    list_filter = ("is_active", "chrome_layout")
    ordering = ("position", "id")
