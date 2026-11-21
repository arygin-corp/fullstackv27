import json

import bleach

from django import template
from django.utils.safestring import mark_safe
from apps.changelog.html_sanitizer import sanitize_rich_html
from apps.changelog.validators import rich_text_has_content
from django import template

register = template.Library()


@register.filter
def has_meaningful_content(value):
    return rich_text_has_content(value)


@register.filter
def sanitized_html(value):
    return mark_safe(sanitize_rich_html(value))

@register.filter
def sanitized_html(value):
    if not value:
        return ""

    return mark_safe(
        bleach.clean(
            value,
            tags=["p", "b", "strong", "i", "ul", "ol", "li", "a"],
            strip=True,
        )
    )
@register.filter
def pretty_value(value):
    if value is None:
        return "Empty"
    if isinstance(value, (dict, list, tuple)):
        return json.dumps(value, indent=2, ensure_ascii=False, default=str)
    return str(value)