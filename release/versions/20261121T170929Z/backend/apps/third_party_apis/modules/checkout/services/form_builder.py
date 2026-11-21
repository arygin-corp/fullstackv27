"""Editable checkout form document used by the form builder page."""

from types import SimpleNamespace

from django.db.utils import OperationalError, ProgrammingError

from .product_requirements import DESCRIPTION_MAX, DESCRIPTION_MIN, INTENDED_USE_MAX, INTENDED_USE_MIN
from .request_form_schema import _matches, build_request_form

DEFINITION_KEY = "marketplace"
FIELD_TYPES = {"text", "textarea", "select", "checkbox", "people_finder", "content"}
VALIDATOR_TYPES = {"required", "required_true", "min_length", "max_length", "regex", "one_of"}
EXPORT_KEYS = (
    "name", "label", "type", "required", "disabled", "options", "options_source",
    "help", "min_length", "max_length", "rows", "visible_when", "disabled_when",
    "value_when", "label_when", "content", "link",
)


def _validator(kind, message, *, value=None, when=None):
    rule = {"type": kind, "message": message, "enforced": False, "source": "code"}
    if value is not None:
        rule["value"] = value
    if when is not None:
        rule["when"] = when
    return rule


SEEDED_VALIDATORS = {
    "v_dar_businessJustification": [
        _validator("min_length", f"Intended Use must be at least {INTENDED_USE_MIN} characters.", value=INTENDED_USE_MIN),
        _validator("max_length", f"Intended Use must not exceed {INTENDED_USE_MAX} characters.", value=INTENDED_USE_MAX),
    ],
    "v_dar_DataReqDescription": [
        _validator("required", "Request description is required."),
        _validator("min_length", f"Request description must be at least {DESCRIPTION_MIN} characters.", value=DESCRIPTION_MIN),
        _validator("max_length", f"Request description must not exceed {DESCRIPTION_MAX} characters.", value=DESCRIPTION_MAX),
    ],
    "v_dar_objectid_reqfor": [
        _validator("required", "Requested-for person is required.", when={"field": "requesting_id", "equals": "User"}),
    ],
    "v_dar_service_account": [
        _validator("required", "Service Account is required.", when={"field": "requesting_id", "equals": "Service Account"}),
    ],
    "appropriateTDSPPod": [
        _validator("required", "TDSP Pod is required.", when={"field": "requesting_tdsp_processing", "equals": "Yes"}),
    ],
    "v_dar_pi": [_validator("required", "PI response is required.")],
    "v_dar_spi": [_validator("required", "Sensitive PI response is required.")],
    "edm_PI_personal_details": [
        _validator("required", "Personal details is required.", when={"any": [
            {"field": "v_dar_pi", "equals": "Yes"},
            {"field": "v_dar_spi", "equals": "Yes"},
        ]}),
    ],
    "v_edm_3rd_party_vendor": [
        _validator("required", "Third-party vendor is required.", when={"any": [
            {"field": "v_dar_pi", "equals": "Yes"},
            {"field": "v_dar_spi", "equals": "Yes"},
        ]}),
    ],
    "v_emd_specify_PII_needs": [
        _validator("required", "Specify the PII need.", when={"field": "edm_PI_personal_details", "equals": "Yes"}),
    ],
    "chk_dar_terms_message": [
        _validator("required_true", "Terms of Use must be accepted."),
    ],
}


def export_definition():
    """The current code form, ready to edit in the builder."""
    product = SimpleNamespace(
        pk=None,
        name="Sample product",
        one_ts_domain=SimpleNamespace(name="Vehicles", control_group=""),
        platform=SimpleNamespace(name="Other"),
        route_identifier=SimpleNamespace(route_id=""),
        environment="Prod",
        data_access_type="read",
        ad_group=SimpleNamespace(name="Sample AD", value="sample-ad"),
        classification=SimpleNamespace(name="Confidential", value="Confidential"),
        datatype=SimpleNamespace(name="Datasets"),
        control_group=None,
    )
    form = build_request_form(product, {"object_id": "", "company_name": ""})
    sections = []
    for section in form["sections"]:
        fields = []
        for field in section["fields"]:
            item = {key: field.get(key) for key in EXPORT_KEYS}
            item["validators"] = [dict(rule) for rule in SEEDED_VALIDATORS.get(field["name"], [])]
            fields.append(item)
        sections.append({"key": section["key"], "label": section["label"], "fields": fields})
    return {"sections": sections}


def field_names(definition):
    names = set()
    for section in (definition or {}).get("sections") or []:
        for field in section.get("fields") or []:
            name = str(field.get("name") or "").strip()
            if name:
                names.add(name)
    return names


def validate_document(document):
    errors = []
    if not isinstance(document, dict) or not isinstance(document.get("sections"), list):
        return ["The document needs a sections list."]
    seen = set()
    for section_index, section in enumerate(document["sections"]):
        if not isinstance(section, dict):
            errors.append(f"Section {section_index + 1} is not an object.")
            continue
        if not str(section.get("key") or "").strip():
            errors.append(f"Section {section_index + 1} needs a key.")
        for field_index, field in enumerate(section.get("fields") or []):
            path = f"{section.get('key') or section_index + 1}.{field_index + 1}"
            if not isinstance(field, dict):
                errors.append(f"{path} is not an object.")
                continue
            name = str(field.get("name") or "").strip()
            if not name:
                errors.append(f"{path} needs a field name.")
            elif name in seen:
                errors.append(f"{name} is listed more than once.")
            else:
                seen.add(name)
            if field.get("type") and field["type"] not in FIELD_TYPES:
                errors.append(f"{name or path} has an unknown type.")
            for rule in field.get("validators") or []:
                if not isinstance(rule, dict) or rule.get("type") not in VALIDATOR_TYPES:
                    errors.append(f"{name or path} has a validator checkout cannot run.")
    return errors


def apply_builder_validators(values, definition, requirements, errors):
    """Run validators marked enforced in the saved form."""
    context = {**values, "datatype": requirements.get("datatype", ""), "classification": requirements.get("classification", "")}
    for section in (definition or {}).get("sections") or []:
        for field in section.get("fields") or []:
            name = field.get("name")
            if not name:
                continue
            for rule in field.get("validators") or []:
                if not rule.get("enforced"):
                    continue
                when = rule.get("when")
                if when and not _matches(when, context):
                    continue
                message = rule.get("message") or "This field is invalid."
                kind = rule.get("type")
                raw = values.get(name)
                text = "" if raw is None else str(raw).strip()
                failed = False
                if kind == "required":
                    failed = text == ""
                elif kind == "required_true":
                    failed = raw is not True and str(raw).strip().lower() not in {"true", "1", "yes", "on"}
                elif kind == "min_length" and text:
                    failed = len(text) < int(rule.get("value") or 0)
                elif kind == "max_length" and text:
                    failed = len(text) > int(rule.get("value") or 0)
                elif kind == "regex" and text:
                    import re
                    failed = re.search(str(rule.get("value") or ""), text) is None
                elif kind == "one_of" and text:
                    failed = text not in list(rule.get("value") or [])
                if failed:
                    bucket = errors.setdefault(name, [])
                    if message not in bucket:
                        bucket.append(message)


RETIRED_FIELDS = {"radar_productname"}


def _without_retired_fields(document):
    sections = []
    for section in document.get("sections") or []:
        fields = [
            field for field in section.get("fields") or []
            if field.get("name") not in RETIRED_FIELDS
        ]
        sections.append({**section, "fields": fields})
    return {**document, "sections": sections}


def load_definition():
    from ..models import CheckoutFormDefinition
    try:
        row = CheckoutFormDefinition.objects.filter(key=DEFINITION_KEY).first()
    except (OperationalError, ProgrammingError):
        return None
    if not row or not row.document:
        return None
    return _without_retired_fields(row.document)


def save_definition(document, user=None):
    from ..models import CheckoutFormDefinition
    row, _created = CheckoutFormDefinition.objects.update_or_create(
        key=DEFINITION_KEY,
        defaults={"document": document, "updated_by": user if getattr(user, "is_authenticated", False) else None},
    )
    return row


def clear_definition():
    from ..models import CheckoutFormDefinition
    CheckoutFormDefinition.objects.filter(key=DEFINITION_KEY).delete()
