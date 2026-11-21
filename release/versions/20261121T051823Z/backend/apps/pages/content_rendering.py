from __future__ import annotations

import hashlib
import re
from collections.abc import Iterable

import bleach
import markdown
from bleach.css_sanitizer import CSSSanitizer
from django.core.exceptions import ValidationError
from django.utils import html
from django.utils.html import conditional_escape, linebreaks
from django.utils.safestring import SafeString, mark_safe

# ---------------------------------------------------------------------------
# HTML Sanitization Configuration
# ---------------------------------------------------------------------------

ALLOWED_PROTOCOLS = frozenset({"http", "https", "mailto"})

RICH_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
    "a",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "hr",
]

HTML_TAGS = RICH_TAGS + [
    "section",
    "article",
    "aside",
    "header",
    "footer",
    "div",
    "span",
    "figure",
    "figcaption",
    "img",
]

RICH_TAGS_SET = frozenset(RICH_TAGS)
HTML_TAGS_SET = frozenset(HTML_TAGS)

ALLOWED_CLASS_NAMES = frozenset(
    {
        "jumbotron",
        "jumbotron-fluid",
        "container",
        "display-4",
        "text-center",
        "lead",
        "legal-title",
        "legal-subtitle",
        "legal-paragraph",
        "table",
    }
)

_STYLE_TAGS = {
    "div",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "ul",
    "ol",
    "li",
    "section",
    "article",
    "aside",
    "header",
    "footer",
    "figure",
    "figcaption",
}

ALLOWED_ATTRIBUTES_BY_TAG = {
    "a": frozenset({"href", "title", "target", "rel", "class"}),
    "img": frozenset(
        {
            "src",
            "alt",
            "title",
            "width",
            "height",
            "loading",
            "class",
        }
    ),
    "th": frozenset(
        {"class", "style", "scope", "colspan", "rowspan"}
    ),
    "td": frozenset(
        {"class", "style", "colspan", "rowspan"}
    ),
    **{
        tag: frozenset({"class", "style"})
        for tag in _STYLE_TAGS - {"th", "td"}
    },
}

CSS_SANITIZER = CSSSanitizer(
    allowed_css_properties=frozenset(
        {
            "background",
            "background-color",
            "border",
            "border-color",
            "border-style",
            "border-width",
            "border-collapse",
            "color",
            "display",
            "font-family",
            "font-size",
            "font-style",
            "font-weight",
            "height",
            "line-height",
            "list-style-type",
            "margin",
            "margin-top",
            "margin-right",
            "margin-bottom",
            "margin-left",
            "max-width",
            "min-width",
            "padding",
            "padding-top",
            "padding-right",
            "padding-bottom",
            "padding-left",
            "text-align",
            "text-decoration",
            "vertical-align",
            "white-space",
            "width",
        }
    )
)

# ---------------------------------------------------------------------------
# Structured Content Configuration
# ---------------------------------------------------------------------------

ALLOWED_BLOCKS = frozenset(
    {"text", "heading", "image", "link", "code", "quote", "faq"}
)

MAX_BLOCKS = 500

HTML_FIELDS = ("content", "answer", "caption")

BLOCK_REQUIRED_FIELDS = {
    "text": ("content",),
    "heading": ("content",),
    "image": ("content",),
    "link": ("content",),
    "code": ("content",),
    "quote": ("content",),
    "faq": ("content", "answer"),
}

# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def decode_source(value: str) -> str:
    decoded = html.unescape(value)

    decoded = (
        decoded
        .replace(r"\<", "<")
        .replace(r"\>", ">")
    )

    decoded = re.sub(
        r"<h1[^>]*>\s*Disclaimer\s*</h1>",
        '<h1 class="display-4 text-center">Disclaimer</h1>',
        decoded,
        count=1,
        flags=re.IGNORECASE,
    )

    return decoded.strip()


def allow_html_attribute(
    tag: str,
    name: str,
    value: str,
) -> bool:
    if name not in ALLOWED_ATTRIBUTES_BY_TAG.get(
        tag,
        frozenset(),
    ):
        return False

    if name == "class":
        classes = value.split()

        return bool(classes) and all(
            cls in ALLOWED_CLASS_NAMES
            for cls in classes
        )

    if tag == "a" and name == "target":
        return value in {"_blank", "_self"}

    if tag == "img" and name == "loading":
        return value in {"lazy", "eager"}

    return True


def sanitize_html(
    value: object,
    tags: Iterable[str] = HTML_TAGS_SET,
) -> str:
    return bleach.clean(
        "" if value is None else str(value),
        tags=tags,
        attributes=allow_html_attribute,
        protocols=ALLOWED_PROTOCOLS,
        css_sanitizer=CSS_SANITIZER,
        strip=True,
        strip_comments=True,
    )


def clean(
    value: object,
    tags: Iterable[str],
) -> str:
    sanitized = sanitize_html(value, tags)

    return bleach.linkify(
        sanitized,
        callbacks=[
            bleach.callbacks.nofollow,
            bleach.callbacks.target_blank,
        ],
        skip_tags=["pre", "code"],
    )

# ---------------------------------------------------------------------------
# Payload Validation
# ---------------------------------------------------------------------------

def validate_block_payload(
    kind: str,
    payload: dict,
) -> dict:

    if not isinstance(payload, dict):
        raise ValidationError(
            "Payload must be an object."
        )

    content = payload.get("content", "")

    if not isinstance(content, str):
        raise ValidationError(
            "payload.content must be text."
        )

    if len(content) > 250_000:
        raise ValidationError(
            "Block content exceeds 250,000 characters."
        )

    result = dict(payload)

    if kind == "rich_text":
        result["content"] = clean(
            content,
            RICH_TAGS_SET,
        )

    elif kind == "html":
        result["content"] = clean(
            content,
            HTML_TAGS_SET,
        )

    elif kind not in {"text", "markdown"}:
        raise ValidationError(
            "Unsupported block type."
        )

    return result


def validate_content(
    content: dict,
) -> dict:

    if not isinstance(content, dict):
        raise ValidationError(
            "Content must be an object."
        )

    blocks = content.get("blocks", [])

    if not isinstance(blocks, list):
        raise ValidationError(
            "blocks must be a list."
        )

    if len(blocks) > MAX_BLOCKS:
        raise ValidationError(
            f"Maximum {MAX_BLOCKS} blocks."
        )

    sanitized_blocks = []

    for index, block in enumerate(blocks):

        if not isinstance(block, dict):
            raise ValidationError(
                f"Invalid block at index {index}."
            )

        block_type = block.get("type")

        if block_type not in ALLOWED_BLOCKS:
            raise ValidationError(
                f"Invalid block at index {index}."
            )

        required_fields = BLOCK_REQUIRED_FIELDS.get(
            block_type,
            ()
        )

        for field in required_fields:
            if not block.get(field):
                raise ValidationError(
                    f"Missing '{field}' "
                    f"for block {block_type} "
                    f"at index {index}."
                )

        item = dict(block)

        for field_name in HTML_FIELDS:
            if (
                field_name in item and
                isinstance(item[field_name], str)
            ):
                item[field_name] = clean(
                    item[field_name],
                    HTML_TAGS_SET,
                )

        sanitized_blocks.append(item)

    return {
        **content,
        "blocks": sanitized_blocks,
    }

# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------

def render_payload(
    kind: str,
    payload: dict,
) -> SafeString:

    value = payload.get("content", "")

    if kind == "text":
        return mark_safe(
            linebreaks(
                conditional_escape(value)
            )
        )

    if kind == "markdown":

        rendered = markdown.markdown(
            value,
            extensions=[
                "extra",
                "sane_lists",
                "tables",
                "fenced_code",
            ],
        )

        sanitized = clean(
            rendered,
            RICH_TAGS_SET,
        )

        return mark_safe(sanitized)

    if kind == "rich_text":
        return mark_safe(
            clean(value, RICH_TAGS_SET)
        )

    if kind == "html":
        return mark_safe(
            clean(value, HTML_TAGS_SET)
        )

    raise ValidationError(
        "Unsupported block type."
    )

# ---------------------------------------------------------------------------
# Checksums
# ---------------------------------------------------------------------------

def payload_checksum(
    kind: str,
    payload: dict,
) -> str:

    content = payload.get("content", "")

    return hashlib.sha256(
        f"{kind}\0{content}".encode("utf-8")
    ).hexdigest()

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

__all__ = [
    "ALLOWED_BLOCKS",
    "HTML_FIELDS",
    "MAX_BLOCKS",
    "HTML_TAGS",
    "RICH_TAGS",
    "decode_source",
    "allow_html_attribute",
    "clean",
    "sanitize_html",
    "validate_block_payload",
    "validate_content",
    "render_payload",
    "payload_checksum",
]