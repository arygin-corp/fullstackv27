from django.db import models


class HackathonPage(models.Model):
    year = models.PositiveIntegerField(unique=True)
    logo_kicker = models.CharField(max_length=80)
    title = models.CharField(max_length=80)
    video = models.CharField(max_length=255, blank=True)
    lines = models.JSONField(default=list, blank=True)
    registration_title = models.CharField(max_length=200, blank=True)
    registration_url = models.CharField(max_length=500, blank=True)
    faq_label = models.CharField(max_length=200, blank=True)
    faq_url = models.CharField(max_length=255, blank=True)
    faq_download = models.CharField(max_length=150, blank=True)
    hosts_label = models.CharField(max_length=80, blank=True)
    hosts_image = models.CharField(max_length=255, blank=True)
    hosts_image_alt = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-year",)

    def __str__(self):
        return f"{self.year} {self.title}"


class HackathonLogo(models.Model):
    class Placement(models.TextChoices):
        HERO = "hero", "Hero"
        HOST = "host", "Host"

    placement = models.CharField(max_length=20, choices=Placement.choices)
    name = models.CharField(max_length=80)
    image = models.CharField(max_length=255)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("placement", "position", "id")
        constraints = [
            models.UniqueConstraint(fields=("placement", "name"), name="hackathon_logo_placement_name"),
        ]

    def __str__(self):
        return self.name


class HackathonSection(models.Model):
    key = models.SlugField(max_length=40, unique=True)
    kicker = models.CharField(max_length=80, blank=True)
    title = models.CharField(max_length=200)
    lead = models.TextField(blank=True)
    mark = models.CharField(max_length=200, blank=True)
    paragraphs = models.JSONField(default=list, blank=True)
    quote = models.TextField(blank=True)
    bullets = models.JSONField(default=list, blank=True)
    image = models.CharField(max_length=255, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.title


class HackathonLink(models.Model):
    section = models.ForeignKey(HackathonSection, on_delete=models.CASCADE, related_name="links")
    label = models.CharField(max_length=200)
    url = models.CharField(max_length=500)
    kind = models.CharField(max_length=20, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("section", "position", "id")
        constraints = [
            models.UniqueConstraint(fields=("section", "label"), name="hackathon_link_section_label"),
        ]

    def __str__(self):
        return self.label


class HackathonScore(models.Model):
    label = models.CharField(max_length=150, unique=True)
    value = models.PositiveSmallIntegerField()
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.label


class HackathonTag(models.Model):
    class Kind(models.TextChoices):
        GROUP = "group", "Group"
        PARTNER = "partner", "Partner"

    kind = models.CharField(max_length=20, choices=Kind.choices)
    label = models.CharField(max_length=150)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("kind", "position", "id")
        constraints = [
            models.UniqueConstraint(fields=("kind", "label"), name="hackathon_tag_kind_label"),
        ]

    def __str__(self):
        return self.label


class HackathonGalleryItem(models.Model):
    label = models.CharField(max_length=150, unique=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.label


class HackathonClip(models.Model):
    title = models.CharField(max_length=150, unique=True)
    text = models.TextField()
    cta = models.CharField(max_length=150)
    url = models.CharField(max_length=500)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.title
