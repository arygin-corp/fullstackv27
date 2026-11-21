# marketplace/templatetags/web_tags.py
from django import template
from django.utils.html import format_html

register = template.Library()

@register.filter(name='attr')
def add_attr(field, css):
    attrs = {}
    definition = css.split(',')
    for d in definition:
        if ':' in d:
            key, val = d.split(':')
            attrs[key] = val
        else:
            attrs[d] = True
    return field.as_widget(attrs=attrs)


_REJECTED = ("reject", "fail", "cancel", "denied", "declin")
_OPEN = ("assign", "open", "progress", "running")
_DONE = ("active", "complete", "success", "enabled", "passed")


def status_tone(value):
    """Map a workflow label to one shared color name."""
    label = str(value or "").strip().lower().replace("_", " ").replace("-", " ")
    if any(word in label for word in _REJECTED):
        return "rejected"
    if "archiv" in label:
        return "archived"
    if "publish" in label:
        return "published"
    if "draft" in label:
        return "draft"
    if "pending" in label or "waiting" in label or "on hold" in label:
        return "pending"
    if "approv" in label:
        return "approved"
    if "submit" in label:
        return "submitted"
    if "review" in label:
        return "review"
    if any(word in label for word in _OPEN):
        return "open"
    if any(word in label for word in _DONE):
        return "approved"
    return "neutral"


@register.filter
def status_class(value):
    return f"status-{status_tone(value)}"


@register.simple_tag
def status_badge(value):
    label = str(value or "").strip() or "Unknown"
    return format_html('<span class="status-badge status-{}">{}</span>', status_tone(label), label)
