from django.contrib import admin

from .models import NewsPost


@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "published_on", "author", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("title", "summary")
