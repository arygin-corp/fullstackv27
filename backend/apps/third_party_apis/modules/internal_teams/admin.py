from django.contrib import admin

from .models import TeamMember, TeamPage


@admin.register(TeamPage)
class TeamPageAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active")


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "position", "is_active")
