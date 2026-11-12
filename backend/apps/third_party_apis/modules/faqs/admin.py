from django.contrib import admin

from .models import Faq, FaqSection


class FaqInline(admin.TabularInline):
    model = Faq
    extra = 0


@admin.register(FaqSection)
class FaqSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "position")
    inlines = (FaqInline,)


@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ("question", "section", "position", "is_active")
    list_filter = ("section", "is_active")
