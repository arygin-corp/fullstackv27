"""Editable document for the standalone Data Access Request form."""
import json
import re
from functools import lru_cache
from pathlib import Path

from django.core.exceptions import ValidationError
from django.db.utils import OperationalError, ProgrammingError

from apps.forms.models import DarFormDocument

PEOPLE_FINDER = "/api/integrations/people-finder/search/gac/user/"
DOCUMENT_KEY = "dar"
API = "API (EIG Application Support)"
TBDP = "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"
WAREHOUSE = "Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)"
GATEWAY = "Gateway Access Request (PowerBI, Tableau, Alteryx, etc)"
MAINFRAME = "Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)"
ORACLE = "Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)"
SQL_PLATFORMS = ["My SQL", "PostgreSQL", "SQL", TBDP]

LABELS = {
    "requesting_id": "Who are you requesting access for?",
    "v_dar_objectid_reqfor": "Person needing access",
    "v_dar_platform": "Platform",
    "v_dar_dataDomainSelect": "Data domain",
    "v_dar_userType": "User type",
    "v_dar_accessType": "Access type",
    "v_dar_pi": "Are you requesting Personal Information (PI) data?",
    "v_dar_spi": "Are you requesting Sensitive Personal Information (Sensitive PI) data?",
    "v_dar_DataReqDescription": "Data Request Description",
    "v_dar_businessJustification": "Intended Use",
    "chk_dar_terms_message": "I have read and accepted the Terms of Use",
    "v_dat_api_name": "API name",
    "v_dar_post_database_schema": "Database schema",
    "v_dar_post_table_names": "Table names",
    "v_dat_data_access_type": "Data access type",
    "v_dar_environment": "Environment",
    "v_dar_select_a_data_warehouse_mart": "Data warehouse",
    "v_dar_bi_data_access_type": "Gateway access type",
    "v_dar_select_an_oracle_access_type": "Oracle access type",
    "v_dar_mainframe_access_type": "Mainframe access type",
    "v_emd_specify_PII_needs": "PII explanation",
    "v_edm_type_of_work": "Type of work",
    "v_edm_3rd_party_vendor": "Third-party vendor",
}

ALWAYS_REQUIRED = {
    "v_dar_objectid_reqfor": "Select the person who needs access.",
    "v_dar_platform": "Select a platform.",
    "v_dar_dataDomainSelect": "Select a data domain.",
    "v_dar_userType": "Select a user type.",
    "v_dar_accessType": "Select an access type.",
    "v_dar_pi": "Answer the personal information question.",
    "v_dar_spi": "Answer the sensitive personal information question.",
    "v_dar_DataReqDescription": "Enter a data request description.",
    "v_dar_businessJustification": "Enter a business justification.",
    "chk_dar_terms_message": "Accept the terms.",
}

EITHER_PERSONAL_INFORMATION = {
    "any": [
        {"field": "v_dar_pi", "equals": "Yes"},
        {"field": "v_dar_spi", "equals": "Yes"},
    ]
}
LEGACY_SPI_VISIBILITY = {"field": "v_emd_PI_access", "equals": "Yes"}

CONDITIONAL = {
    "v_dat_api_name": ({"field": "v_dar_platform", "equals": API}, "Enter the API name."),
    "v_dar_post_database_schema": ({"field": "v_dar_platform", "in": SQL_PLATFORMS}, "Enter the database schema."),
    "v_dar_post_table_names": ({"field": "v_dar_platform", "in": SQL_PLATFORMS}, "Enter the table names."),
    "v_dat_data_access_type": ({"field": "v_dar_platform", "in": SQL_PLATFORMS + [API]}, "Select a data access type."),
    "v_dar_environment": ({"field": "v_dar_platform", "in": SQL_PLATFORMS + [API]}, "Select an environment."),
    "v_dar_select_a_data_warehouse_mart": ({"field": "v_dar_platform", "equals": WAREHOUSE}, "Select a data warehouse."),
    "v_dar_bi_data_access_type": ({"field": "v_dar_platform", "equals": GATEWAY}, "Select a gateway access type."),
    "v_dar_select_an_oracle_access_type": ({"field": "v_dar_platform", "equals": ORACLE}, "Select an Oracle access type."),
    "v_dar_mainframe_access_type": ({"field": "v_dar_platform", "equals": MAINFRAME}, "Select a mainframe access type."),
    "edm_PI_personal_details": (EITHER_PERSONAL_INFORMATION, "Answer the personal details question."),
    "v_emd_specify_PII_needs": ({"field": "edm_PI_personal_details", "equals": "Yes"}, "Explain the personal information needed."),
    "v_edm_type_of_work": (EITHER_PERSONAL_INFORMATION, "Select the type of work."),
    "v_edm_3rd_party_vendor": (EITHER_PERSONAL_INFORMATION, "Answer the third-party question."),
}


def _form_path(filename):
    return Path(__file__).resolve().parents[4] / "frontend/src/app/@pages/forms2/data-access-request" / filename


def _clean_label(raw):
    raw = re.split(r"<(?:p|small|div|br|ul|ol|li|h[1-6])\b", raw, maxsplit=1, flags=re.I)[0]
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = raw.replace("*", " ")
    return re.sub(r"\s+", " ", raw).strip(" :")


def _fallback_label(name):
    words = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name)
    words = re.sub(r"^(?:v|b|chk)_(?:dar|emd|edm|dat|dare)_", "", words)
    words = words.replace("_", " ").strip()
    return words[:1].upper() + words[1:] if words else name


@lru_cache(maxsize=1)
def _template_labels():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return {}
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    label_re = re.compile(r"<label\b[^>]*>(.*?)</label>", re.S | re.I)
    controls = list(re.finditer(r'formControlName="([^"]+)"', html))
    labels = {}
    for index, match in enumerate(controls):
        name = match.group(1)
        if name in labels:
            continue
        previous_end = controls[index - 1].end() if index else 0
        next_start = controls[index + 1].start() if index + 1 < len(controls) else len(html)
        before = html[previous_end:match.start()]
        after = html[match.end():next_start][:800]
        preceding = list(label_re.finditer(before))
        following = label_re.search(after)
        previous = preceding[-1] if preceding else None
        previous_distance = (len(before) - previous.end()) if previous else 10 ** 9
        following_distance = following.start() if following else 10 ** 9
        text = ""
        if following and following_distance < previous_distance and following_distance < 200:
            text = _clean_label(following.group(1))
        elif previous and previous_distance < 1200:
            text = _clean_label(previous.group(1))
        if text:
            labels[name] = text
    return labels


def _label_for(name):
    return _template_labels().get(name) or _fallback_label(name)


@lru_cache(maxsize=1)
def _template_control_names():
    """Controls on the desktop request form, in the order a person fills them."""
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return tuple()
    html = path.read_text()
    start = html.find("<!--LARGE SCREEN FORM-->")
    end = html.find("<!--MOBILE FORM-->")
    chunk = html[start:end] if start != -1 and end != -1 else html
    chunk = re.sub(r"<!--.*?-->", "", chunk, flags=re.S)
    names = []
    for match in re.finditer(r'formControlName="([^"]+)"', chunk):
        name = match.group(1)
        if name not in names:
            names.append(name)
    return tuple(names)


@lru_cache(maxsize=1)
def _template_checkboxes():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return frozenset()
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    names = set()
    for match in re.finditer(r"<input\b([^>]*)>", html, re.I):
        attrs = match.group(1)
        if not re.search(r"""type=["']checkbox["']""", attrs, re.I):
            continue
        name = re.search(r'formControlName="([^"]+)"', attrs)
        if name:
            names.add(name.group(1))
    return frozenset(names)


@lru_cache(maxsize=1)
def _template_textareas():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return frozenset()
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    names = set()
    for match in re.finditer(r"<textarea\b([^>]*)>", html, re.I):
        name = re.search(r'formControlName="([^"]+)"', match.group(1))
        if name:
            names.add(name.group(1))
    return frozenset(names)


@lru_cache(maxsize=1)
def _template_min_lengths():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return {}
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    lengths = {}
    for match in re.finditer(r"<(?:textarea|input)\b([^>]*)>", html, re.I):
        attrs = match.group(1)
        name = re.search(r'formControlName="([^"]+)"', attrs)
        length = re.search(r'minlength="(\d+)"', attrs, re.I)
        if name and length and name.group(1) not in lengths:
            lengths[name.group(1)] = int(length.group(1))
    return lengths


@lru_cache(maxsize=1)
def _template_terms():
    """Acknowledgement text that sits with the Terms of Use checkbox."""
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return ()
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    match = re.search(r'id="terms"[^>]*>(.*?)</div>', html, re.S | re.I)
    if not match:
        return ()
    lines = []
    for paragraph in re.findall(r"<p\b[^>]*>(.*?)</p>", match.group(1), re.S | re.I):
        text = re.sub(r"<[^>]+>", " ", paragraph)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            lines.append(text)
    return tuple(lines)


@lru_cache(maxsize=1)
def _template_options():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return {}
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    options = {}
    for match in re.finditer(r"<select\b([^>]*)>(.*?)</select>", html, re.S | re.I):
        name_match = re.search(r'formControlName="([^"]+)"', match.group(1))
        if not name_match or name_match.group(1) in options:
            continue
        choices = []
        for option in re.finditer(r"<option\b([^>]*)>(.*?)</option>", match.group(2), re.S | re.I):
            value_match = re.search(r'value="([^"]*)"', option.group(1))
            label = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", option.group(2))).strip()
            value = value_match.group(1) if value_match else label
            if not value:
                continue
            choices.append({"value": value, "label": label or value})
        if choices:
            options[name_match.group(1)] = choices
    return options


def _split_top(expr, operator):
    parts = []
    depth = 0
    buffer = []
    index = 0
    while index < len(expr):
        if expr[index] == "(":
            depth += 1
        elif expr[index] == ")":
            depth -= 1
        if depth == 0 and expr.startswith(operator, index):
            parts.append("".join(buffer).strip())
            buffer = []
            index += len(operator)
            continue
        buffer.append(expr[index])
        index += 1
    parts.append("".join(buffer).strip())
    return [part for part in parts if part]


_COMPARISON = re.compile(
    r"^(?:form\.get\((?:'([^']+)'|\"([^\"]+)\")\)\.value|form\.value\.([A-Za-z0-9_]+))\s*(===|==|!==|!=)\s*(?:'([^']*)'|\"([^\"]*)\")$"
)


def _parse_visibility_expr(expr):
    expr = expr.strip()
    alternatives = _split_top(expr, "||")
    if len(alternatives) > 1:
        rules = [_parse_visibility_expr(part) for part in alternatives]
        if any(rule is None for rule in rules):
            return None
        return {"any": rules}
    requirements = _split_top(expr, "&&")
    if len(requirements) > 1:
        rules = [_parse_visibility_expr(part) for part in requirements]
        if any(rule is None for rule in rules):
            return None
        return {"all": rules} if len(rules) > 1 else rules[0]
    if expr.startswith("(") and expr.endswith(")"):
        return _parse_visibility_expr(expr[1:-1].strip())
    match = _COMPARISON.match(expr)
    if not match:
        return None
    field = match.group(1) or match.group(2) or match.group(3)
    value = match.group(5) if match.group(5) is not None else match.group(6)
    key = "not_equals" if match.group(4) in {"!=", "!=="} else "equals"
    return {"field": field, key: value}


def _directive(attrs, name):
    match = re.search(name + r'="(.*?)"', attrs, re.S)
    if not match:
        return None
    return re.sub(r"\s+", " ", match.group(1)).strip()


@lru_cache(maxsize=1)
def _template_visibility():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return {}
    html = re.sub(r"<!--.*?-->", "", path.read_text(), flags=re.S)
    tag_re = re.compile(r"<(/?)([A-Za-z][\w:-]*)\b([^>]*)>", re.S)
    stack = []
    rules = {}
    for match in tag_re.finditer(html):
        closing = match.group(1) == "/"
        tag = match.group(2)
        attrs = match.group(3) or ""
        if closing:
            if stack:
                stack.pop()
            continue
        control = re.search(r'formControlName="([^"]+)"', attrs)
        if control and control.group(1) not in rules:
            collected = []
            for visible_expr, hidden_expr in stack:
                if visible_expr:
                    rule = _parse_visibility_expr(visible_expr)
                    if rule:
                        collected.append(rule)
                if hidden_expr:
                    rule = _parse_visibility_expr(hidden_expr)
                    if rule:
                        collected.append({"not": rule})
            if collected:
                rules[control.group(1)] = collected[0] if len(collected) == 1 else {"all": collected}
            else:
                rules[control.group(1)] = None
        void = attrs.rstrip().endswith("/") or tag.lower() in {"input", "img", "br", "hr", "option", "source"}
        if not void:
            stack.append((_directive(attrs, r"\*ngIf"), _directive(attrs, r"\[hidden\]")))
    rules["v_dar_objectid_reqfor"] = None
    return rules


def _desktop_html():
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return ""
    html = path.read_text()
    start = html.find("<!--LARGE SCREEN FORM-->")
    end = html.find("<!--MOBILE FORM-->")
    chunk = html[start:end] if start != -1 and end != -1 else html
    return re.sub(r"<!--.*?-->", "", chunk, flags=re.S)


@lru_cache(maxsize=1)
def _template_supplied():
    """Static values the request page writes into hidden route, group, and organization fields."""
    html = _desktop_html()
    if not html:
        return {}
    tag_re = re.compile(r"<(/?)([A-Za-z][\w:-]*)\b([^>]*)>", re.S)
    stack = []
    supplied = {}
    for match in tag_re.finditer(html):
        closing = match.group(1) == "/"
        tag = match.group(2)
        attrs = match.group(3) or ""
        if closing:
            if stack:
                stack.pop()
            continue
        control = re.search(r'formControlName="([^"]+)"', attrs)
        model = re.search(r'ngModel="([^"]*)"', attrs)
        if control and model and "{{" not in model.group(1):
            collected = []
            for visible_expr, hidden_expr in stack:
                if visible_expr:
                    rule = _parse_visibility_expr(visible_expr)
                    if rule:
                        collected.append(rule)
                if hidden_expr:
                    rule = _parse_visibility_expr(hidden_expr)
                    if rule:
                        collected.append({"not": rule})
            when = None
            if collected:
                when = collected[0] if len(collected) == 1 else {"all": collected}
            caption = ""
            window = html[max(0, match.start() - 500):match.start()]
            captions = re.findall(r"<small\b[^>]*>(.*?)</small>", window, re.S | re.I)
            if captions:
                caption = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", captions[-1])).strip()
            entry = supplied.setdefault(control.group(1), {"values": [], "disabled": True, "label": caption})
            if caption and not entry["label"]:
                entry["label"] = caption
            disabled = bool(re.search(r"(?:^|\s)disabled(?:\s|=|$)", attrs)) or '[attr.disabled]="true"' in attrs
            entry["disabled"] = entry["disabled"] and disabled
            value = model.group(1).strip()
            key = json.dumps({"when": when, "value": value}, sort_keys=True)
            if key not in {json.dumps(item, sort_keys=True) for item in entry["values"]}:
                entry["values"].append({"when": when, "value": value})
        void = attrs.rstrip().endswith("/") or tag.lower() in {"input", "img", "br", "hr", "option", "source"}
        if not void:
            stack.append((_directive(attrs, r"\*ngIf"), _directive(attrs, r"\[hidden\]")))
    return supplied


def _apply_supplied_values(field):
    supplied = _template_supplied().get(str(field.get("name") or ""))
    if not supplied or not supplied["values"]:
        return
    if not field.get("value_when"):
        field["value_when"] = supplied["values"]
    rules = [item["when"] for item in supplied["values"] if item.get("when")]
    current = field.get("visible_when")
    if rules and current in (None, rules[0]):
        field["visible_when"] = rules[0] if len(rules) == 1 else {"any": rules}
    if supplied["disabled"]:
        field["disabled"] = True
    if supplied.get("label") and _generated_label(field.get("name"), field.get("label")):
        field["label"] = supplied["label"]


SECTION_BREAKS = {
    "PLATFORM SELECTION": "Platform",
    "DATA DOMAIN SELECTION": "Data domain",
    "INDIVIDUAL/APPLICATION ACCESS REQUEST": "Access type",
    "MAINFRAME ACCESS FOR MANUFACTURING": "Mainframe manufacturing",
    "REQUEST DESCRIPTION": "Request description",
    "API NAME": "API",
    "SALES MAINFRAME ACCESS TYPE": "Mainframe access",
    "DB2 PLAN / TABLE ACCESS": "DB2 access",
    "IMS ACCESS": "IMS access",
    "MAINFRAME FLAT FILE ACCESS": "Mainframe flat file",
    "MAINFRAME SERVICE ACCOUNT": "Mainframe service account",
    "MAINFRAME TSO ID": "Mainframe TSO ID",
    "MAINFRAME REPORT ACCESS": "Mainframe report",
    "MQ ACCESS": "MQ access",
    "TWS/OPC SCHEDULING ACCESS": "TWS/OPC scheduling",
    "DATA WAREHOUSE": "Data warehouse",
    "BI DATA ACCESS TYPE": "BI data access",
    "DATABASE/SCHEMA": "Database and schema",
    "ORACLE ACCESS TYPE": "Oracle",
    "DATA ACCESS TYPE": "Data access type",
    "DATA REQUEST DESCRIPTION": "Data request description",
    "INTENDED USE": "Intended use",
    "PII REQUEST": "Personal information",
    "ACKNOWLEDGEMENT CONFIRMATION": "Terms",
}


def _section_key(label, used):
    base = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_") or "section"
    key = base
    index = 2
    while key in used:
        key = f"{base}_{index}"
        index += 1
    used.add(key)
    return key


@lru_cache(maxsize=1)
def _template_sections():
    """Map each request-form control to the section it sits in."""
    path = _form_path("data-access-request.component.html")
    if not path.exists():
        return {}
    html = path.read_text()
    start = html.find("<!--LARGE SCREEN FORM-->")
    end = html.find("<!--MOBILE FORM-->")
    chunk = html[start:end] if start != -1 and end != -1 else html
    token = re.compile(r"<!--\s*(.*?)\s*-->|formControlName=\"([^\"]+)\"", re.S)
    current = "Requesting access"
    order = []
    groups = {}
    seen = set()
    for match in token.finditer(chunk):
        comment, name = match.group(1), match.group(2)
        if comment is not None:
            text = re.sub(r"\s+", " ", comment).strip().upper()
            if text in SECTION_BREAKS:
                current = SECTION_BREAKS[text]
            continue
        if name == "v_dar_userType":
            current = "User type"
        if name in seen:
            continue
        seen.add(name)
        groups.setdefault(current, []).append(name)
        if current not in order:
            order.append(current)
    used = set()
    placement = {}
    for position, label in enumerate(order):
        key = _section_key(label, used)
        for name in groups[label]:
            placement[name] = (position, key, label)
    return placement


def _sections_for(fields):
    placement = _template_sections()
    buckets = {}
    for field in fields:
        position, key, label = placement.get(field["name"], (10_000, "other", "Other fields"))
        bucket = buckets.setdefault(position, {"key": key, "label": label, "fields": []})
        bucket["fields"].append(field)
    sections = [buckets[position] for position in sorted(buckets)]
    sections.append({"key": "additional", "label": "Additional fields", "fields": []})
    return sections


def _regroup_request_section(document):
    """Split a saved single Request section into the form's section groups."""
    sections = document.get("sections") or []
    request = next((section for section in sections if section.get("key") == "request"), None)
    if request is None:
        return document
    placement = _template_sections()
    leftovers = []
    buckets = {}
    for field in request.get("fields") or []:
        found = placement.get(str(field.get("name") or ""))
        if not found:
            leftovers.append(field)
            continue
        position, key, label = found
        bucket = buckets.setdefault(position, {"key": key, "label": label, "fields": []})
        bucket["fields"].append(field)
    if not buckets:
        return document
    grouped = [buckets[position] for position in sorted(buckets)]
    if leftovers:
        request["fields"] = leftovers
        grouped.append(request)
    others = [section for section in sections if section.get("key") != "request"]
    additional = [section for section in others if section.get("key") == "additional"]
    custom = [section for section in others if section.get("key") != "additional"]
    document["sections"] = grouped + custom + additional
    return document


def _apply_template_visibility(field):
    name = str(field.get("name") or "")
    rules = _template_visibility()
    if name not in rules:
        return
    current = field.get("visible_when")
    seeded = CONDITIONAL.get(name, (None,))[0]
    if current in (None, seeded, LEGACY_SPI_VISIBILITY):
        field["visible_when"] = rules[name]
        for rule in field.get("validators") or []:
            if isinstance(rule, dict) and rule.get("when") in (seeded, LEGACY_SPI_VISIBILITY):
                rule["when"] = rules[name]


def _apply_template_options(field):
    """Keep the choices from the current request form."""
    name = str(field.get("name") or "")
    if name == "v_dar_objectid_reqfor":
        if str(field.get("options_source") or "").startswith("marketplace:"):
            field["options_source"] = ""
        if not field.get("options_source"):
            field["options_source"] = PEOPLE_FINDER
        return
    choices = _template_options().get(name)
    if not choices:
        return
    field["options"] = choices
    if str(field.get("options_source") or "").startswith("marketplace:"):
        field["options_source"] = ""
    if str(field.get("type") or "text") in {"text", ""}:
        field["type"] = "select"


def _apply_template_shape(field):
    """Use the request page's text areas, lengths, and terms acknowledgement."""
    name = str(field.get("name") or "")
    if name in _template_textareas() and str(field.get("type") or "text") == "text":
        field["type"] = "textarea"
    if name in _template_min_lengths() and not field.get("min_length"):
        field["min_length"] = _template_min_lengths()[name]
    if name == "chk_dar_terms_message" and not field.get("content"):
        field["content"] = list(_template_terms())


def _generated_label(name, label):
    current = str(label or "").strip()
    return current in {name, name.replace("_", " "), _fallback_label(name), LABELS.get(name, "")}


def refresh_labels(document):
    """Match the saved form to the fields on the current request page."""
    _regroup_request_section(document)
    _sync_template_fields(document)
    for section in document.get("sections") or []:
        for field in section.get("fields") or []:
            name = str(field.get("name") or "")
            if _generated_label(name, field.get("label")):
                field["label"] = _label_for(name)
            _apply_template_options(field)
            _apply_template_shape(field)
            _apply_template_visibility(field)
            _apply_supplied_values(field)
    return document


def _component_names():
    path = _form_path("data-access-request.component.ts")
    if not path.exists():
        return list(LABELS)
    text = path.read_text()
    match = re.search(r"this\.form = this\.fb\.group\(\{(.*?)\n    \}\);", text, re.S)
    if not match:
        return list(LABELS)
    return re.findall(r"^\s{6}([A-Za-z0-9_]+):", match.group(1), re.M)


def _validator(message, when=None):
    return {
        "type": "required",
        "message": message,
        "enforced": True,
        "source": "code",
        "when": when,
    }


def _field(name):
    when, message = CONDITIONAL.get(name, (None, None))
    validators = []
    if name in ALWAYS_REQUIRED:
        validators.append(_validator(ALWAYS_REQUIRED[name]))
    elif message:
        validators.append(_validator(message, when))
    options = _template_options().get(name, [])
    visibility = _template_visibility()
    visible_when = visibility[name] if name in visibility else when
    if name.startswith("chk_") or name in _template_checkboxes():
        field_type = "checkbox"
    elif name in _template_textareas():
        field_type = "textarea"
    elif options:
        field_type = "select"
    else:
        field_type = "text"
    return {
        "name": name,
        "label": _label_for(name),
        "type": field_type,
        "required": name in ALWAYS_REQUIRED,
        "disabled": False,
        "options": options,
        "content": list(_template_terms()) if name == "chk_dar_terms_message" else [],
        "min_length": _template_min_lengths().get(name),
        "options_source": PEOPLE_FINDER if name == "v_dar_objectid_reqfor" else "",
        "help": "",
        "max_length": None,
        "visible_when": visible_when,
        "disabled_when": None,
        "value_when": [],
        "label_when": [],
        "validators": validators,
    }


def _with_supplied(field):
    _apply_supplied_values(field)
    return field


def export_definition():
    names = list(_template_control_names()) or _component_names()
    return {
        "key": DOCUMENT_KEY,
        "title": "Data Access Request",
        "sections": _sections_for([_with_supplied(_field(name)) for name in names]),
    }


def _sync_template_fields(document):
    """Drop controls that are not on the request page and add any that are missing."""
    live = list(_template_control_names())
    if not live:
        return
    live_names = set(live)
    sections = document.setdefault("sections", [])
    for section in sections:
        if section.get("key") == "additional":
            continue
        section["fields"] = [
            field for field in section.get("fields") or []
            if str(field.get("name") or "") in live_names
        ]
    present = {
        str(field.get("name") or "")
        for section in sections
        for field in section.get("fields") or []
    }
    missing = [_with_supplied(_field(name)) for name in live if name not in present]
    if not missing:
        return
    additional = next((section for section in sections if section.get("key") == "additional"), None)
    for bucket in _sections_for(missing):
        if bucket["key"] == "additional" or not bucket["fields"]:
            continue
        target = next((section for section in sections if section.get("key") == bucket["key"]), None)
        if target is None:
            insert_at = sections.index(additional) if additional in sections else len(sections)
            sections.insert(insert_at, bucket)
            continue
        target.setdefault("fields", []).extend(bucket["fields"])


def validate_document(document):
    if not isinstance(document, dict):
        raise ValidationError("Form document must be an object.")
    sections = document.get("sections")
    if not isinstance(sections, list) or not sections:
        raise ValidationError("Form document needs at least one section.")
    names = []
    for section in sections:
        if not isinstance(section, dict) or not str(section.get("label") or "").strip():
            raise ValidationError("Every section needs a label.")
        for field in section.get("fields") or []:
            name = str(field.get("name") or "").strip()
            if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
                raise ValidationError(f"{name or 'A field'} needs a name made of letters, numbers, and underscores.")
            if not str(field.get("label") or "").strip():
                raise ValidationError(f"{name} needs a label.")
            field_type = str(field.get("type") or "text").strip()
            if field_type not in {"text", "textarea", "select", "checkbox", "number", "date", "email"}:
                raise ValidationError(f"{name} uses an unsupported type.")
            if not isinstance(field.get("options") or [], list):
                raise ValidationError(f"{name} options must be a list.")
            names.append(name)
            for rule in field.get("validators") or []:
                if not isinstance(rule, dict) or not str(rule.get("type") or "").strip():
                    raise ValidationError(f"{name} has a validator without a type.")
    duplicates = {name for name in names if names.count(name) > 1}
    if duplicates:
        raise ValidationError(f"Field names must be unique: {', '.join(sorted(duplicates))}.")
    return document


def load_definition():
    try:
        stored = DarFormDocument.objects.filter(key=DOCUMENT_KEY).first()
    except (OperationalError, ProgrammingError):
        return None
    if stored is None or not stored.document:
        return None
    return stored.document


def save_definition(document, user=None):
    cleaned = validate_document(json.loads(json.dumps(document)))
    stored, _created = DarFormDocument.objects.get_or_create(key=DOCUMENT_KEY)
    stored.document = cleaned
    stored.save(update_fields=["document", "updated_at"])
    return stored


def clear_definition():
    DarFormDocument.objects.filter(key=DOCUMENT_KEY).delete()
