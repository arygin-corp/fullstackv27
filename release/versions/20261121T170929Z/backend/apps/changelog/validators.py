import re
from html import unescape

SECTION_LETTERS = "ABCDEFGHIJ"
_TAG_RE = re.compile(r"<[^>]*>")


def rich_text_has_content(value):
    if value is None:
        return False
    text = unescape(str(value)).replace("\xa0", " ")
    return bool(_TAG_RE.sub("", text).strip())
