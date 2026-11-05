# apps/profiles/models.py
import os

from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()


def user_avatar_upload_path(instance, filename):
    """
    Enhanced upload path with better error handling
    """
    try:
        user = instance.user

        # Clean up the names to avoid filesystem issues
        first_name = (user.first_name or 'unknown').strip().replace(' ', '_')
        last_name = (user.last_name or 'user').strip().replace(' ', '_')

        # Remove special characters that might cause issues
        import re
        first_name = re.sub(r'[^a-zA-Z0-9_-]', '', first_name)
        last_name = re.sub(r'[^a-zA-Z0-9_-]', '', last_name)

        user_folder = f"{first_name}_{last_name}"

        return os.path.join('marketplace', user_folder, 'avatar', filename)

    except AttributeError:
        # Fallback if user relationship doesn't exist
        return os.path.join('marketplace', 'unknown_user', 'avatar', filename)


ACCESS_SUPERADMIN = "superadmin"
ACCESS_ADMIN = "admin"
ACCESS_MODERATOR = "moderator"
ACCESS_SUPPORT = "support"
ACCESS_ENGINEER = "engineer"
ACCESS_DEDICATED_MANAGER = "dedicated_manager"
ACCESS_STAFF = "staff"
ACCESS_USER = "user"
ACCESS_CHOICES = (
    (ACCESS_SUPERADMIN, "SuperAdmin"),
    (ACCESS_ADMIN, "Admin"),
    (ACCESS_MODERATOR, "Moderator"),
    (ACCESS_SUPPORT, "Support"),
    (ACCESS_ENGINEER, "Engineer"),
    (ACCESS_DEDICATED_MANAGER, "Dedicated-Manager"),
    (ACCESS_USER, "User"),
)
PROFILE_ACCESS_TYPES = {
    ACCESS_MODERATOR,
    ACCESS_SUPPORT,
    ACCESS_ENGINEER,
    ACCESS_DEDICATED_MANAGER,
}


def access_type_for(user):
    """SuperAdmin follows the superuser flag. The other roles are stored on the profile."""
    from django.core.exceptions import ObjectDoesNotExist

    try:
        stored = user.profile.access_type
    except ObjectDoesNotExist:
        stored = ACCESS_USER
    if getattr(user, "is_superuser", False) or stored == ACCESS_SUPERADMIN:
        return ACCESS_SUPERADMIN
    if stored == ACCESS_STAFF:
        return ACCESS_USER
    if stored in PROFILE_ACCESS_TYPES:
        return stored
    if getattr(user, "is_staff", False) or stored == ACCESS_ADMIN:
        return ACCESS_ADMIN
    return ACCESS_USER


class Profile(models.Model):
    is_verified = models.BooleanField(default=False, help_text="Checked by Superadmin to allow login.")
    access_type = models.CharField(max_length=20, choices=ACCESS_CHOICES, default=ACCESS_USER)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    team = models.IntegerField('Team', blank=True)
    image = models.ImageField('Profile Image', upload_to=user_avatar_upload_path, max_length=150, default='default.gif', blank=True)
    job_title = models.CharField('Job Title', max_length=150, blank=True)
    job_subtitle = models.CharField('Job Subtitle', max_length=150, blank=True)
    department = models.CharField('Department', max_length=150, blank=True)
    address_line1 = models.CharField('Address Line 1', max_length=50, blank=True)
    address_line2 = models.CharField('Address Line 2', max_length=50, blank=True)
    city = models.CharField('City', max_length=25, blank=True)
    state = models.CharField(
        'State',
        max_length=25,
        blank=True,
        choices=[('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'), ('AR', 'Arkansas'), ('CA', 'California'),
                 ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'), ('DC', 'District of Columbia'),
                 ('FL', 'Florida'), ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'), ('IL', 'Illinois'),
                 ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'), ('KY', 'Kentucky'), ('LA', 'Louisiana'),
                 ('ME', 'Maine'), ('MD', 'Maryland'), ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'),
                 ('MS', 'Mississippi'), ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'),
                 ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'),
                 ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'), ('OR', 'Oregon'),
                 ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'), ('SD', 'South Dakota'),
                 ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'), ('VT', 'Vermont'), ('VA', 'Virginia'),
                 ('WA', 'Washington'), ('WV', 'West Virginia'), ('WI', 'Wisconsin'), ('WY', 'Wyoming')]
    )
    zipcode = models.CharField('Zipcode', max_length=5, blank=True)
    country = models.CharField(
        'Country',
        max_length=25,
        blank=True,
        choices=[('Canada', 'Canada'), ('United States', 'United States')]
    )
    phone = models.CharField('Office Phone', max_length=25, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.user.email} - {'Verified' if self.is_verified else 'Pending'}"

    def __str__(self):
        return self.user.first_name + " " + self.user.last_name


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    # This will either get the existing profile or create a new one if it doesn't exist.
    # It handles both newly created users and existing users without a profile.
    Profile.objects.get_or_create(user=instance)
