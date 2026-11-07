from difflib import ndiff
from html import unescape

from django.utils.html import strip_tags

SECTION_LETTERS = "ABCDEFGHIJ"


def plain_text(value):
    """Create stable readable text from CKEditor HTML."""
    return " ".join(unescape(strip_tags(str(value or ""))).replace("\xa0", " ").split())


def field_change(label, before, after):
    before_text = plain_text(before)
    after_text = plain_text(after)
    if before_text == after_text:
        return None
    return {
        "field": label,
        "before": before_text,
        "after": after_text,
        "diff": [
            {"kind": line[:1], "text": line[2:]}
            for line in ndiff(before_text.splitlines() or [before_text], after_text.splitlines() or [after_text])
            if line[:1] in {"-", "+"}
        ],
    }


def compare_posts(before, after):
    """Return a presentation-ready, deterministic release comparison."""
    changes = []
    for field_name, label in (
        ("title", "Title"),
        ("desc", "Description"),
        ("release_date", "Release date"),
        ("status", "Status"),
    ):
        change = field_change(label, getattr(before, field_name), getattr(after, field_name))
        if change:
            changes.append(change)

    sections = []
    for letter in SECTION_LETTERS:
        before_category = getattr(before, f"type{letter}", None)
        after_category = getattr(after, f"type{letter}", None)
        section_changes = []
        for label, old_value, new_value in (
            ("Category", getattr(before_category, "name", ""), getattr(after_category, "name", "")),
            ("Subtitle", getattr(before, f"subTitle{letter}", ""), getattr(after, f"subTitle{letter}", "")),
            ("Content", getattr(before, f"post{letter}", ""), getattr(after, f"post{letter}", "")),
        ):
            change = field_change(label, old_value, new_value)
            if change:
                section_changes.append(change)
        if section_changes:
            sections.append({"section": letter, "changes": section_changes})

    return {
        "before": before,
        "after": after,
        "summary_changes": changes,
        "section_changes": sections,
        "change_count": len(changes) + sum(len(item["changes"]) for item in sections),
    }
