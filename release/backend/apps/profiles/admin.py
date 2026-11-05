# apps/profiles/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from apps.profiles.models import Profile

# Define an inline admin descriptor for Profile model
# which acts a bit like a singleton
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'profile'
    list_display = ('first_name', 'last_name', 'user_email', 'username', 'is_staff', 'is_verified')
    list_filter = ('is_verified',)
    search_fields = ('user__email',)

    # Only superadmins can toggle the verified checkbox
    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            return ('is_verified',)
        return ()

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Optionally, you can still register Profile separately if you want a top-level link
# admin.site.register(Profile)