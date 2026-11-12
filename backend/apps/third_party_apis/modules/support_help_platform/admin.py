from django.contrib import admin

from .models import SupportArticle, SupportCategory, SupportPrompt


class SupportArticleInline(admin.TabularInline):
    model = SupportArticle
    extra = 0
    fields = ("title", "position", "is_active")


@admin.register(SupportCategory)
class SupportCategoryAdmin(admin.ModelAdmin):
    list_display = ("label", "source_id", "position")
    inlines = (SupportArticleInline,)


@admin.register(SupportArticle)
class SupportArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "position", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("title", "summary")


@admin.register(SupportPrompt)
class SupportPromptAdmin(admin.ModelAdmin):
    list_display = ("question", "position", "is_active")
