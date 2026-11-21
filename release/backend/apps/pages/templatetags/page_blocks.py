from django import template
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from apps.pages.content_rendering import render_payload
register=template.Library()
@register.simple_tag(takes_context=True)
def render_content_block(context,block):
    if not block or not block.is_enabled or block.block_type not in {"text","markdown","rich_text","html"}: return ""
    return mark_safe(render_to_string(f"gdx_admin/pages/pages/page/blocks/{block.block_type}.html",{"block":block,"rendered_content":render_payload(block.block_type,block.payload)},request=context.get("request")))
