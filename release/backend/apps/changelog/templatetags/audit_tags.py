from django import template
import json

register = template.Library()


@register.filter
def pretty_value(value):
    if value is None:
        return "-"

    if isinstance(value, (dict, list)):
        return json.dumps(value, indent=2, sort_keys=True)

    return str(value)