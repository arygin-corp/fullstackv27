from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

ALLOWED_TAGS = {
    "a", "abbr", "blockquote", "br", "code", "em", "h4", "h5", "h6",
    "li", "ol", "p", "pre", "span", "strong", "ul",
}
VOID_TAGS = {"br"}
ALLOWED_ATTRIBUTES = {"a": {"href", "title"}, "span": {"class"}}
ALLOWED_PROTOCOLS = {"", "http", "https", "mailto"}


class _AllowlistParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.open_tags = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag not in ALLOWED_TAGS:
            return
        safe_attrs = []
        for name, value in attrs:
            name = name.lower()
            if name not in ALLOWED_ATTRIBUTES.get(tag, set()) or value is None:
                continue
            if name == "href" and urlparse(value.strip()).scheme.lower() not in ALLOWED_PROTOCOLS:
                continue
            safe_attrs.append((name, value))
        if tag == "a":
            safe_attrs.extend([("rel", "noopener noreferrer nofollow"), ("target", "_blank")])
        attr_text = "".join(
            f' {escape(name, quote=True)}="{escape(value, quote=True)}"'
            for name, value in safe_attrs
        )
        self.parts.append(f"<{tag}{attr_text}>")
        if tag not in VOID_TAGS:
            self.open_tags.append(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag not in ALLOWED_TAGS or tag in VOID_TAGS or tag not in self.open_tags:
            return
        while self.open_tags:
            current = self.open_tags.pop()
            self.parts.append(f"</{current}>")
            if current == tag:
                break

    def handle_data(self, data):
        self.parts.append(escape(data))

    def close(self):
        super().close()
        while self.open_tags:
            self.parts.append(f"</{self.open_tags.pop()}>")


def sanitize_rich_html(value):
    """Sanitize CKEditor HTML with a dependency-free presentation allowlist."""
    parser = _AllowlistParser()
    parser.feed(str(value or ""))
    parser.close()
    return "".join(parser.parts)
