"""Checkout request form as sections and fields for the Angular app.

Field order, labels, options, and show/hide rules follow
frontend/src/app/@shared/components/product/components/request-access/request-access.component.html.
"""

from django.conf import settings

from .product_requirements import (
    CLASSIFICATIONS, DESCRIPTION_MAX, DESCRIPTION_MIN, INTENDED_USE_MAX, INTENDED_USE_MIN,
    PUBLIC_CLASSIFICATIONS, PUBLIC_INTENDED_USE, RESTRICTED_CLASSIFICATIONS,
    checkout_control_group, requirements_for_product,
)

TMNA_COMPANIES = (
    "AIR", "BJN", "BSL", "BTR", "CPT", "GTS", "MSO", "R&D", "SIA", "TAL",
    "TBC", "TCA", "TDP", "TCN", "TIN", "TKY", "TLS", "TMA", "TME", "TMM",
    "TMN", "TMP", "TMS", "TNA", "TTC", "TTX", "TWV",
)
TFS_COMPANIES = ("TCC", "TIS", "TFB", "TFS", "TSM", "TPR")
ORGANIZATION_RULES = (
    (TMNA_COMPANIES, "Toyota Motor North America"),
    (TFS_COMPANIES, "Toyota Financial Services"),
    (("MTM",), "Mazda Manufacturing"),
    (("Woven Planet",), "Woven Planet"),
    (("Toyota Connected",), "Toyota Connected"),
    (("TMC",), "Toyota Motors Corporation"),
)
USER_TYPE_RULES = (
    (TMNA_COMPANIES, "TMNAUsers"),
    (TFS_COMPANIES, "TMNAAffiliates"),
)
PLATFORM_API = "API (EIG Application Support)"
PLATFORM_TBDP = "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"
PLATFORM_OTHER = "Other"
YES_NO = ({"value": "Yes", "label": "Yes"}, {"value": "No", "label": "No"})
EDITABLE_FIELDS = frozenset({
    "requesting_id",
    "v_dar_objectid_reqfor",
    "v_dar_service_account",
    "requesting_tdsp_processing",
    "appropriateTDSPPod",
    "v_dar_businessJustification",
    "v_dar_pi",
    "v_dar_spi",
    "edm_PI_personal_details",
    "v_emd_specify_PII_needs",
    "v_edm_type_of_work",
    "v_edm_3rd_party_vendor",
    "chk_dar_terms_message",
})


def build_request_form(product, creator, saved_values=None, line_key=None, revision=None, definition=None):
    """Return the renderable form for one product, with current values filled in."""
    saved_values = dict(saved_values or {})
    values = _base_values(product, creator)
    _apply_derived_values(values)
    _overlay_saved_values(values, saved_values)
    requirements = requirements_for_product(product)
    sections = _sections(values, requirements)
    if definition:
        sections = apply_definition(sections, {**values, "datatype": requirements.get("datatype", "")}, definition)
    return {
        "product_id": getattr(product, "pk", None),
        "line_key": str(line_key) if line_key else None,
        "revision": revision,
        "values": values,
        "sections": sections,
    }


def _base_values(product, creator):
    domain = getattr(product, "one_ts_domain", None)
    version = str(getattr(settings, "APP_VERSION", "") or "")
    return {
        "v_dar_product_name": _text(getattr(product, "name", "")),
        "v_dar_dm_version": f"Version {version}" if version else "",
        "v_dar_objectid_createdby": _text((creator or {}).get("object_id")),
        "requesting_id": "Me",
        "v_dar_objectid_reqfor": "",
        "v_dar_service_account": "",
        "requesting_tdsp_processing": "No",
        "appropriateTDSPPod": "",
        "companyName": _text((creator or {}).get("company_name")),
        "v_dar_organization": "",
        "v_dar_userType": "",
        "v_dar_accessType": "User Access",
        "v_dar_dataDomainSelect": _related(domain, "name"),
        "v_custom_control_group": checkout_control_group(product),
        "v_dar_platform": _related(getattr(product, "platform", None), "name"),
        "v_dar_OtherType": _text(getattr(product, "name", "")),
        "v_dat_api_name": _text(getattr(product, "name", "")),
        "v_dar_post_database_schema": _text(getattr(product, "name", "")),
        "v_dar_post_table_names": _text(getattr(product, "name", "")),
        "v_custom_routing_rule_identifier": _related(getattr(product, "route_identifier", None), "route_id"),
        "v_dar_tbdp_is_this_request_fort_irm_pricing": "No",
        "v_dar_environment": _text(getattr(product, "environment", "")),
        "v_dat_data_access_type": _text(getattr(product, "data_access_type", "")),
        "v_dar_databaseName": _text(getattr(product, "name", "")),
        "v_dar_ad_group": _related(getattr(product, "ad_group", None), "value", "name"),
        "v_dar_accessReqClassification": _related(getattr(product, "classification", None), "name", "value"),
        "v_dar_DataReqDescription": _text(getattr(product, "name", "")),
        "v_dar_businessJustification": "",
        "v_dar_pi": "",
        "v_dar_spi": "",
        "edm_PI_personal_details": "",
        "v_emd_specify_PII_needs": "",
        "v_edm_type_of_work": "",
        "v_edm_3rd_party_vendor": "",
        "chk_dar_terms_message": False,
    }


def _apply_derived_values(values):
    values["v_dar_organization"] = _mapped_value(values["companyName"], ORGANIZATION_RULES)
    values["v_dar_userType"] = _mapped_value(values["companyName"], USER_TYPE_RULES)
    if values["v_dar_accessReqClassification"] in PUBLIC_CLASSIFICATIONS:
        values["v_dar_businessJustification"] = PUBLIC_INTENDED_USE


def _overlay_saved_values(values, saved_values):
    for name, raw in saved_values.items():
        if name not in EDITABLE_FIELDS or name not in values:
            continue
        if name == "v_dar_businessJustification" and values["v_dar_accessReqClassification"] in PUBLIC_CLASSIFICATIONS:
            continue
        values[name] = _as_bool(raw) if name == "chk_dar_terms_message" else raw
    _apply_derived_values(values)
    if (
        values["v_dar_accessReqClassification"] in RESTRICTED_CLASSIFICATIONS
        and "v_dar_businessJustification" in saved_values
    ):
        values["v_dar_businessJustification"] = saved_values["v_dar_businessJustification"]


def _sections(values, requirements):
    values = {**values, "datatype": requirements.get("datatype", "")}
    company_known = [code for codes, _label in ORGANIZATION_RULES for code in codes]
    organization_when = [
        {"when": {"field": "companyName", "in": list(codes)}, "value": label}
        for codes, label in ORGANIZATION_RULES
    ]
    user_type_when = [
        {"when": {"field": "companyName", "in": list(codes)}, "value": label}
        for codes, label in USER_TYPE_RULES
    ]
    fields = [
        _field("v_dar_product_name", "Product Name", "text", values, section="product"),
        _field("v_dar_dm_version", "Application Build Version", "text", values, section="product"),
        _field("v_dar_objectid_createdby", "Request Created By ObjectID", "text", values, section="requester"),
        _field(
            "requesting_id",
            "Who are you requesting data access for?",
            "select",
            values,
            section="requester",
            required=True,
            disabled=False,
            options=(
                {"value": "Me", "label": "For me"},
                {"value": "User", "label": "For someone else"},
                {
                    "value": "Service Account",
                    "label": "For a Service Account",
                    "visible": requirements["is_dataset"],
                    "visible_when": {"field": "datatype", "equals": "Datasets"},
                },
            ),
        ),
        _field(
            "v_dar_objectid_reqfor",
            "Requested for",
            "people_finder",
            values,
            section="requester",
            disabled=False,
            options_source="/api/integrations/people-finder/search/gac/user/",
            visible_when={"field": "requesting_id", "equals": "User"},
        ),
        _field(
            "v_dar_service_account",
            "Service Account (only for TBDP platform requests)",
            "text",
            values,
            section="requester",
            required=True,
            disabled=False,
            visible_when={"field": "requesting_id", "equals": "Service Account"},
        ),
        _field(
            "requesting_tdsp_processing",
            "Is this for TDSP?",
            "select",
            values,
            section="requester",
            required=True,
            disabled=False,
            options=({"value": "No", "label": "No"}, {"value": "Yes", "label": "Yes"}),
            visible_when={"all": [
                {"field": "datatype", "equals": "Datasets"},
                {"field": "requesting_id", "not_equals": "Service Account"},
            ]},
        ),
        _field(
            "appropriateTDSPPod",
            "Select the appropriate TDSP Pod",
            "select",
            values,
            section="requester",
            required=True,
            disabled=False,
            options_source="/api/integrations/tbdp-pods/dropdown/",
            visible_when={"field": "requesting_tdsp_processing", "equals": "Yes"},
        ),
        _field(
            "v_dar_ad_group",
            "AD Group",
            "text",
            values,
            section="requester",
            visible_when={"field": "datatype", "equals": "Datasets"},
            label_when=(
                {"when": {"field": "requesting_id", "equals": "Service Account"}, "label": "Service Account AD Group"},
                {"when": {"all": [
                    {"field": "requesting_id", "not_equals": "Service Account"},
                    {"field": "requesting_tdsp_processing", "equals": "Yes"},
                ]}, "label": "TDSP AD Group"},
                {"when": {"all": [
                    {"field": "requesting_id", "not_equals": "Service Account"},
                    {"field": "requesting_tdsp_processing", "equals": "No"},
                ]}, "label": "AD Group"},
            ),
        ),
        _field("companyName", "Company Name", "text", values, section="requester"),
        _field(
            "v_dar_organization",
            "Organization Name",
            "text",
            values,
            section="requester",
            visible_when={"field": "companyName", "in": company_known},
            value_when=organization_when,
        ),
        _field(
            "v_dar_userType",
            "User Type",
            "text",
            values,
            section="requester",
            visible_when={"field": "companyName", "in": list(TMNA_COMPANIES + TFS_COMPANIES)},
            value_when=user_type_when,
        ),
        _field("v_dar_accessType", "Access Type", "text", values, section="access"),
        _field(
            "v_dar_dataDomainSelect",
            "Data Domains",
            "select",
            values,
            section="access",
            options=_domain_options(),
        ),
        _field("v_custom_control_group", "Control Group", "text", values, section="access"),
        _field(
            "v_dar_platform",
            "Platform",
            "select",
            values,
            section="access",
            options=(
                {"value": "", "label": "Choose One"},
                {"value": PLATFORM_API, "label": PLATFORM_API},
                {"value": PLATFORM_TBDP, "label": PLATFORM_TBDP},
                {"value": PLATFORM_OTHER, "label": PLATFORM_OTHER},
            ),
        ),
        _field(
            "v_dar_OtherType",
            "If other, please specify",
            "text",
            values,
            section="access",
            visible_when={"field": "v_dar_platform", "equals": PLATFORM_OTHER},
        ),
        _field(
            "v_dat_api_name",
            "API Name",
            "text",
            values,
            section="access",
            visible_when={"field": "v_dar_platform", "equals": PLATFORM_API},
        ),
        _field(
            "v_dar_post_database_schema",
            "Database/Schema",
            "text",
            values,
            section="access",
            visible_when={"field": "v_dar_platform", "equals": PLATFORM_TBDP},
        ),
        _field(
            "v_dar_post_table_names",
            "Table Name(s)",
            "text",
            values,
            section="access",
            visible_when={"field": "v_dar_platform", "equals": PLATFORM_TBDP},
        ),
        _field("v_custom_routing_rule_identifier", "Route Identifier", "text", values, section="access"),
        _field(
            "v_dar_tbdp_is_this_request_fort_irm_pricing",
            "Is this request for TBDP IRM-Pricing data access?",
            "select",
            values,
            section="access",
            options=YES_NO,
        ),
        _field(
            "v_dar_environment",
            "Environment",
            "select",
            values,
            section="access",
            options=(
                {"value": "QA", "label": "QA"},
                {"value": "Dev", "label": "Development"},
                {"value": "Prod", "label": "Production"},
                {"value": "All", "label": "All"},
            ),
        ),
        _field(
            "v_dat_data_access_type",
            "Data Access Type",
            "select",
            values,
            section="access",
            options=(
                {"value": "read", "label": "Read"},
                {"value": "modify", "label": "Modify"},
                {"value": "insert", "label": "Insert"},
                {"value": "update", "label": "Update"},
                {"value": "delete", "label": "Delete"},
                {"value": "na", "label": "Not Applicable"},
            ),
        ),
        _field("v_dar_databaseName", "Database Name", "text", values, section="access"),
        _field(
            "v_dar_accessReqClassification",
            "Access Request Classification",
            "select",
            values,
            section="access",
            options=(
                {"value": "Public", "label": "Public"},
                {"value": "Protected", "label": "Protected"},
                {"value": "Confidential", "label": "Confidential"},
                {"value": "Highly Confidential", "label": "Highly Confidential"},
                {"value": "Personal Information", "label": "Personal Information"},
                {"value": "Legal/Privileged", "label": "Legal/ Privileged Information"},
            ),
        ),
        _field(
            "v_dar_DataReqDescription",
            "Data Request Description",
            "textarea",
            values,
            section="request_details",
            required=True,
            min_length=DESCRIPTION_MIN,
            max_length=DESCRIPTION_MAX,
            rows=24,
        ),
        _field(
            "v_dar_businessJustification",
            "Intended Use",
            "textarea",
            values,
            section="business_justification",
            required=True,
            min_length=INTENDED_USE_MIN,
            max_length=INTENDED_USE_MAX,
            rows=24,
            help=(
                "The Intended Use should explain the purpose and business value including "
                "key performance indicators (KPI), problem statement, and decision scenario "
                "(what are you trying to solve/answer)."
            ),
            visible_when={"field": "v_dar_accessReqClassification", "in": list(CLASSIFICATIONS)},
            disabled_when={"field": "v_dar_accessReqClassification", "in": list(PUBLIC_CLASSIFICATIONS)},
            value_when=(
                {"when": {"field": "v_dar_accessReqClassification", "in": list(PUBLIC_CLASSIFICATIONS)}, "value": PUBLIC_INTENDED_USE},
                {"when": {"field": "v_dar_accessReqClassification", "in": list(RESTRICTED_CLASSIFICATIONS)}, "value": ""},
            ),
        ),
        _field(
            "v_dar_pi",
            "Are you requesting for any Personal Information (PI) data?",
            "select",
            values,
            section="data_usage",
            required=True,
            disabled=False,
            options=YES_NO,
            visible_when={"field": "v_dar_accessReqClassification", "in": list(CLASSIFICATIONS)},
        ),
        _field(
            "v_dar_spi",
            "Are you requesting for any Sensitive Personal Information (SPI) data?",
            "select",
            values,
            section="data_usage",
            required=True,
            disabled=False,
            options=YES_NO,
            visible_when={"field": "v_dar_accessReqClassification", "in": list(CLASSIFICATIONS)},
        ),
        _field(
            "edm_PI_personal_details",
            "Do you need access to any personal details like customer name, address, place of birth, etc?",
            "select",
            values,
            section="data_usage",
            required=True,
            disabled=False,
            options=YES_NO,
            visible_when={"any": [{"field": "v_dar_pi", "equals": "Yes"}, {"field": "v_dar_spi", "equals": "Yes"}]},
        ),
        _field(
            "v_emd_specify_PII_needs",
            "Please specify in detail the business use case why you need access to Sensitive PI?",
            "textarea",
            values,
            section="data_usage",
            required=True,
            disabled=False,
            min_length=12,
            max_length=400,
            rows=4,
            visible_when={"field": "edm_PI_personal_details", "equals": "Yes"},
        ),
        _field(
            "v_edm_type_of_work",
            "Type of Work",
            "select",
            values,
            section="data_usage",
            disabled=False,
            options=(
                {"value": "Development", "label": "Development"},
                {"value": "Analysis", "label": "Analysis"},
                {"value": "Research", "label": "Research"},
                {"value": "Extract", "label": "Extract"},
                {"value": "Other", "label": "Other"},
                {"value": "All", "label": "All"},
            ),
            visible_when={"any": [{"field": "v_dar_pi", "equals": "Yes"}, {"field": "v_dar_spi", "equals": "Yes"}]},
        ),
        _field(
            "v_edm_3rd_party_vendor",
            "Is the data going to be shared with 3rd Party Vendor.",
            "select",
            values,
            section="data_usage",
            required=True,
            disabled=False,
            options=YES_NO,
            visible_when={"any": [{"field": "v_dar_pi", "equals": "Yes"}, {"field": "v_dar_spi", "equals": "Yes"}]},
        ),
        {
            "name": "terms_notice",
            "label": "Please read and accept the Terms of Use, and specifically acknowledge that:",
            "type": "content",
            "section": "terms",
            "required": False,
            "disabled": True,
            "visible": True,
            "value": None,
            "options": [],
            "content": [
                "a. I am authorized to use this data solely to perform my job duties.",
                "b. I shall not disclose it to any person or entity unless approved in advance.",
                "c. I shall protect and will not share my access credentials with anyone.",
                "d. I will not use the data for unauthorized, fraudulent or malicious purposes, or in a manner that could damage, disable, overburden or impair TMNA systems.",
                "e. I understand that this data should only be used for the use case for which it has been approved. Any use beyond this specific use case requires an additional corresponding approval.",
                "f. I have read and will comply with all TMNA and Data Enablement & Global Compliance policies pertaining to data.",
            ],
            "link": {"label": "https://dataenablement.toyota.com/", "url": "https://dataenablement.toyota.com/"},
            "visible_when": None,
            "disabled_when": None,
            "value_when": [],
        },
        _field(
            "chk_dar_terms_message",
            "I have read and accepted the Terms of Use",
            "checkbox",
            values,
            section="terms",
            required=True,
            disabled=False,
        ),
    ]
    grouped = {
        "product": ("Product", []),
        "requester": ("Requester", []),
        "access": ("Access", []),
        "request_details": ("Request Details", []),
        "business_justification": ("Business Justification", []),
        "data_usage": ("Data Usage", []),
        "terms": ("Terms of Use", []),
    }
    for field in fields:
        section = field.pop("section")
        grouped[section][1].append(field)
    return [{"key": key, "label": label, "fields": section_fields} for key, (label, section_fields) in grouped.items()]


def _field(name, label, field_type, values, *, section, required=False, disabled=True, options=(), options_source=None, visible_when=None, disabled_when=None, value_when=(), label_when=(), help="", min_length=None, max_length=None, rows=None):
    visible = _matches(visible_when, values)
    is_disabled = _matches(disabled_when, values) if disabled_when else disabled
    return {
        "name": name,
        "label": _active_label(label, label_when, values),
        "type": field_type,
        "section": section,
        "options_source": options_source,
        "required": required,
        "disabled": is_disabled if visible else True,
        "visible": visible,
        "value": values.get(name),
        "options": [dict(option) for option in options],
        "help": help,
        "min_length": min_length,
        "max_length": max_length,
        "rows": rows,
        "visible_when": visible_when,
        "disabled_when": disabled_when,
        "value_when": [dict(rule) for rule in value_when],
        "label_when": [dict(rule) for rule in label_when],
    }


def _active_label(label, label_when, values):
    for rule in label_when:
        if _matches(rule.get("when"), values):
            return rule["label"]
    return label


def apply_definition(sections, values, definition):
    """Replace the code form with the saved builder document and recompute rules."""
    by_name = {}
    for section in sections:
        for field in section["fields"]:
            by_name[field["name"]] = field
    built = []
    for section in definition.get("sections") or []:
        fields = []
        for spec in section.get("fields") or []:
            name = str(spec.get("name") or "").strip()
            if not name:
                continue
            base = dict(by_name.get(name) or {})
            base["name"] = name
            base["label"] = spec.get("label") or base.get("label") or name
            base["type"] = spec.get("type") or base.get("type") or "text"
            base["required"] = bool(spec.get("required"))
            base["options"] = spec.get("options") if "options" in spec else base.get("options") or []
            base["options_source"] = spec.get("options_source", base.get("options_source"))
            base["help"] = spec.get("help") or ""
            base["min_length"] = spec.get("min_length")
            base["max_length"] = spec.get("max_length")
            base["rows"] = spec.get("rows")
            base["visible_when"] = spec.get("visible_when")
            base["disabled_when"] = spec.get("disabled_when")
            base["value_when"] = spec.get("value_when") or []
            base["label_when"] = spec.get("label_when") or []
            base["validators"] = spec.get("validators") or []
            base["content"] = spec.get("content", base.get("content"))
            base["link"] = spec.get("link", base.get("link"))
            if spec.get("disabled_when"):
                base["disabled"] = _matches(spec.get("disabled_when"), values)
            else:
                base["disabled"] = bool(spec.get("disabled", base.get("disabled", True)))
            base["visible"] = _matches(spec.get("visible_when"), values)
            base["label"] = _active_label(base["label"], base["label_when"], values)
            base["value"] = values.get(name, base.get("value"))
            fields.append(base)
        built.append({"key": section.get("key") or "custom", "label": section.get("label") or "Custom", "fields": fields})
    return built or sections


def _matches(rule, values):
    if not rule:
        return True
    if "all" in rule:
        return all(_matches(item, values) for item in rule["all"])
    if "any" in rule:
        return any(_matches(item, values) for item in rule["any"])
    current = values.get(rule.get("field"))
    if "equals" in rule:
        return current == rule["equals"]
    if "not_equals" in rule:
        return current != rule["not_equals"]
    if "in" in rule:
        return current in rule["in"]
    return False


def _mapped_value(company, rules):
    for codes, label in rules:
        if company in codes:
            return label
    return ""


def _domain_options():
    pairs = (
        ("Customer", "Customer"),
        ("Dealer Identity", "Dealer Identity"),
        ("Dealership", "Dealership"),
        ("Data Governance", "Data Governance"),
        ("Digital Assets", "Digital Assets"),
        ("Finance", "Enterprise Corporate Application"),
        ("Finance", "Finance"),
        ("Identity Access Management", "Identity Access Management"),
        ("Manufacturing", "Manufacturing"),
        ("Manufacturing Parts", "Parts"),
        ("Product Quality", "Quality"),
        ("Research and Development", "Research and Development"),
        ("Service History", "Service History"),
        ("Telematics", "Telematics"),
        ("Vehicles", "Vehicles"),
        ("Warranty", "Warranty"),
    )
    return [{"value": value, "label": label} for value, label in pairs]


def _related(value, *attrs):
    if value is None or isinstance(value, str):
        return _text(value)
    for attr in attrs:
        found = getattr(value, attr, None)
        if found:
            return str(found)
    return ""


def _text(value):
    if value is None:
        return ""
    return str(value)


def _as_bool(value):
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"true", "1", "yes", "on"}
