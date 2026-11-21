from django.contrib import admin

from .models import (
    HackathonClip,
    HackathonGalleryItem,
    HackathonLink,
    HackathonLogo,
    HackathonPage,
    HackathonScore,
    HackathonSection,
    HackathonTag,
)


class HackathonLinkInline(admin.TabularInline):
    model = HackathonLink
    extra = 0


@admin.register(HackathonPage)
class HackathonPageAdmin(admin.ModelAdmin):
    list_display = ("year", "title", "is_active")


@admin.register(HackathonLogo)
class HackathonLogoAdmin(admin.ModelAdmin):
    list_display = ("name", "placement", "position", "is_active")
    list_filter = ("placement", "is_active")


@admin.register(HackathonSection)
class HackathonSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "key", "position", "is_active")
    inlines = (HackathonLinkInline,)


@admin.register(HackathonScore)
class HackathonScoreAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "position", "is_active")


@admin.register(HackathonTag)
class HackathonTagAdmin(admin.ModelAdmin):
    list_display = ("label", "kind", "position", "is_active")
    list_filter = ("kind", "is_active")


@admin.register(HackathonGalleryItem)
class HackathonGalleryItemAdmin(admin.ModelAdmin):
    list_display = ("label", "position", "is_active")


@admin.register(HackathonClip)
class HackathonClipAdmin(admin.ModelAdmin):
    list_display = ("title", "cta", "position", "is_active")
