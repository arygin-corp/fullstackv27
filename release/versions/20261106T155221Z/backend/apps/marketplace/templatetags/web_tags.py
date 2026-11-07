# marketplace/templatetags/web_tags.py
from django import template

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