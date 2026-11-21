from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .html_sanitizer import sanitize_rich_html
from .validators import rich_text_has_content

SECTION_LETTERS = "ABCDEFGHIJ"
TAG_CLASS_MAP = {
    "New": "new",
    "Enhancements": "enhancements",
    "Feature": "feature",
    "Updates": "updates",
    "Remove": "remove",
    "Fixes": "fixes",
    "Issues": "issues",
}


def serialize_sections(post):
    """Convert the retained A-J model into ordered timeline sections."""
    sections = []
    for letter in SECTION_LETTERS:
        content = getattr(post, f"post{letter}", None)
        if not rich_text_has_content(content):
            continue
        category = getattr(post, f"type{letter}", None)
        category_name = getattr(category, "name", "")
        safe_html = sanitize_rich_html(content)
        sections.append({
            "key": letter,
            "category": category_name,
            "tag_class": TAG_CLASS_MAP.get(category_name, "feature"),
            "subtitle": getattr(post, f"subTitle{letter}", "") or "",
            "html": safe_html,
            "text": " ".join(strip_tags(safe_html).split()),
        })
    return sections


def timeline_payload(post, include_html=False, has_next=False):
    sections = serialize_sections(post)
    payload = {
        "id": post.pk,
        "version": post.version,
        "release_date": post.release_date.isoformat() if post.release_date else None,
        "title": post.title,
        "description": post.desc,
        "status": post.status,
        "sections": sections,
    }
    if include_html:
        payload["html"] = render_to_string(
            "changelog/public/timeline_item.html",
            {"post": post, "sections": sections, "has_next": has_next},
        )
    return payload
