import math
import re

UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.I,
)


def clean_text(text):
    if not text:
        return ""
    cleaned = str(text)
    cleaned = re.sub(r"\.json$", "", cleaned, flags=re.I)
    cleaned = cleaned.replace("_", " ").replace("@", "")
    cleaned = re.sub(r"\s+", " ", cleaned.lower())
    cleaned = re.sub(r"[^\w\s]", "", cleaned, flags=re.I)
    return cleaned.strip()


def compare_strings(left, right):
    left = re.sub(r"\s+", "", str(left or "")).lower()
    right = re.sub(r"\s+", "", str(right or "")).lower()
    if left == right:
        return 1
    if len(left) < 2 or len(right) < 2:
        return 0
    counts = {}
    for index in range(len(left) - 1):
        gram = left[index:index + 2]
        counts[gram] = counts.get(gram, 0) + 1
    intersection = 0
    for index in range(len(right) - 1):
        gram = right[index:index + 2]
        count = counts.get(gram, 0)
        if count > 0:
            counts[gram] = count - 1
            intersection += 1
    return (2.0 * intersection) / (len(left) + len(right) - 2)


def clamp01(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    if math.isnan(number) or math.isinf(number):
        return 0
    return max(0, min(1, number))


def to_unit_score(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    if math.isnan(number) or math.isinf(number):
        return 0
    if 0 <= number <= 1:
        return number
    if 1 < number <= 100:
        return number / 100
    return clamp01(number)


def to_percent_score(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    if math.isnan(number) or math.isinf(number):
        return 0
    if 0 <= number <= 1:
        return max(0, min(100, number * 100))
    if 1 < number <= 100:
        return max(0, min(100, number))
    return max(0, min(100, number))


def is_uuid_like(value):
    return isinstance(value, str) and bool(UUID_RE.match(value.strip()))


def normalize_domain_name(name):
    if not isinstance(name, str) or not name:
        return ""
    return re.sub(r"\s+", " ", name.lower().strip())


def to_singular(word):
    if not word:
        return word
    if word.endswith("ies"):
        return word[:-3] + "y"
    if word.endswith("es"):
        return word[:-2]
    if word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def calculate_domain_match_score(domain1, domain2):
    if not domain1 or not domain2:
        return 0
    if domain1 == domain2:
        return 1.0
    singular1 = to_singular(domain1)
    singular2 = to_singular(domain2)
    if singular1 == singular2:
        return 0.95
    if domain1 in domain2 or domain2 in domain1:
        return 0.9
    if singular1 in singular2 or singular2 in singular1:
        return 0.85
    words1 = domain1.split()
    words2 = domain2.split()
    common = [
        word for word in words1
        if any(word == other or to_singular(word) == to_singular(other) for other in words2)
    ]
    overlap = len(common) / max(len(words1), len(words2))
    return overlap * 0.8


def normalize_metadata_value(value):
    return str(value or "").strip().lower()


def normalize_metadata_list(value):
    source = value if isinstance(value, list) else ([value] if value not in (None, "") else [])
    seen = set()
    rows = []
    for item in source:
        text = str(item or "").strip()
        key = normalize_metadata_value(text)
        if not text or not key or key in seen:
            continue
        seen.add(key)
        rows.append(text)
    return rows


def to_slug(text):
    slug = str(text or "").lower()
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"[^\w\-]+", "", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def escape_html(value):
    return (
        str(value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )


def grade_and_color(percentage):
    try:
        number = float(percentage)
    except (TypeError, ValueError):
        number = float("nan")
    boundaries = [
        (97, 100, "A", "+", "success", "Exceptional Match"),
        (93, 96.99, "A", "", "success", "Excellent Match"),
        (90, 92.99, "A", "-", "success", "Very Good Match"),
        (87, 89.99, "B", "+", "info", "Good Match"),
        (83, 86.99, "B", "", "info", "Above Average Match"),
        (80, 82.99, "B", "-", "info", "Slightly Above Average"),
        (77, 79.99, "C", "+", "warning", "Average Match"),
        (73, 76.99, "C", "", "warning", "Below Average Match"),
        (70, 72.99, "C", "-", "warning", "Weak Match"),
        (67, 69.99, "D", "+", "danger", "Poor Match"),
        (63, 66.99, "D", "", "danger", "Very Poor Match"),
        (60, 62.99, "D", "-", "danger", "Minimal Match"),
        (0, 59.99, "F", "", "danger", "No Match"),
    ]
    for minimum, maximum, grade, modifier, class_name, description in boundaries:
        if minimum <= number <= maximum:
            return {
                "grade": grade,
                "modifier": modifier,
                "fullGrade": f"{grade}{modifier}" if modifier else grade,
                "class": class_name,
                "description": description,
                "percentage": number,
            }
    return {
        "grade": "F",
        "modifier": "",
        "fullGrade": "F",
        "class": "danger",
        "description": "No Match",
        "percentage": number,
    }
