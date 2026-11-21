from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils.text import slugify

IMAGE_EXTENSIONS = {
    "apng", "avif", "bmp", "gif", "heic", "heif", "ico", "jfif", "jpe", "jpeg", "jpg",
    "png", "svg", "svgz", "tif", "tiff", "webp",
}


def validate_team_image(uploaded):
    name = (getattr(uploaded, "name", "") or "").rsplit("/", 1)[-1].lower()
    extension = name.rsplit(".", 1)[-1] if "." in name else ""
    content_type = (getattr(uploaded, "content_type", "") or "").split(";", 1)[0].strip().lower()
    uploaded.seek(0)
    header = uploaded.read(16384)
    uploaded.seek(0)
    if _is_svg(extension, content_type, header):
        return
    if extension in IMAGE_EXTENSIONS or content_type.startswith("image/"):
        if _looks_like_image(header) or _pillow_accepts(uploaded):
            return
    elif _pillow_accepts(uploaded):
        return
    raise ValidationError("Upload an image file. SVG, PNG, JPG, GIF, WebP, and other image types are accepted.")


def _is_svg(extension, content_type, header):
    if extension not in {"svg", "svgz"} and "svg" not in content_type:
        return False
    sample = header.lstrip().lower()
    return b"<svg" in sample or (b"<?xml" in sample and b"<svg" in sample)


def _looks_like_image(header):
    if header.startswith((b"\xff\xd8\xff", b"\x89PNG", b"GIF87a", b"GIF89a", b"BM")):
        return True
    if header.startswith(b"RIFF") and b"WEBP" in header[:16]:
        return True
    if header.startswith((b"II*\x00", b"MM\x00*")):
        return True
    if header[:4] == b"\x00\x00\x01\x00":
        return True
    brands = header[4:32]
    return any(brand in brands for brand in (b"avif", b"avis", b"heic", b"heif", b"mif1", b"msf1"))


def _pillow_accepts(uploaded):
    try:
        from PIL import Image
    except ImportError:
        return False
    try:
        uploaded.seek(0)
        with Image.open(uploaded) as image:
            image.verify()
        return True
    except Exception:
        return False
    finally:
        uploaded.seek(0)


class TeamImageField(models.FileField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if validate_team_image not in self.validators:
            self.validators.append(validate_team_image)

class Tenant(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Team(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="teams", )
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    icon = TeamImageField(upload_to="teams/icons/", blank=True, null=True)
    logo = TeamImageField(upload_to="teams/logos/", blank=True, null=True)
    cover_image = TeamImageField(upload_to="teams/covers/", blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_teams')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='teams', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class TeamMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,)
    team = models.ForeignKey(Team, on_delete=models.CASCADE,)
    is_active = models.BooleanField(default=True)