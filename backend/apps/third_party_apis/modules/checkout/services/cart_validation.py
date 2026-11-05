from dataclasses import dataclass
from .product_requirements import (
    ALLOWED_CART_ITEM_FORM_FIELDS, DESCRIPTION_MAX, DESCRIPTION_MIN,
    INTENDED_USE_MAX, INTENDED_USE_MIN, PUBLIC_CLASSIFICATIONS, PUBLIC_INTENDED_USE,
    SECTION_LABELS, requirements_for_product,
)

@dataclass(frozen=True)
class CartItemValidationResult:
    request_details_complete: bool
    business_justification_complete: bool
    data_usage_complete: bool
    is_complete: bool
    missing_sections: tuple[str, ...]
    field_errors: dict
    normalized_form_values: dict

def _yes(value): return str(value or "").strip().lower() == "yes"
def _text(values, key): return str(values.get(key) or "").strip()
def _checked(value):
    if isinstance(value, bool): return value
    return str(value or "").strip().lower() in {"true", "1", "yes", "on"}

def validate_cart_item(product, submitted_values, definition=None):
    allowed = set(ALLOWED_CART_ITEM_FORM_FIELDS)
    if definition:
        from .form_builder import field_names
        allowed |= field_names(definition)
    unexpected = sorted(set(submitted_values) - allowed)
    if unexpected:
        return CartItemValidationResult(False, False, False, False, tuple(SECTION_LABELS.values()), {"form_values": [f"Unexpected fields: {', '.join(unexpected)}"]}, {})
    values = {k: v.strip() if isinstance(v, str) else v for k, v in submitted_values.items() if k in allowed}
    req = requirements_for_product(product); errors = {}
    if req["classification"] in PUBLIC_CLASSIFICATIONS and not _text(values, "v_dar_businessJustification"):
        values["v_dar_businessJustification"] = PUBLIC_INTENDED_USE
    business = _text(values, "v_dar_businessJustification")
    if len(business) < INTENDED_USE_MIN: errors.setdefault("v_dar_businessJustification", []).append(f"Intended Use must be at least {INTENDED_USE_MIN} characters.")
    if len(business) > INTENDED_USE_MAX: errors.setdefault("v_dar_businessJustification", []).append(f"Intended Use must not exceed {INTENDED_USE_MAX} characters.")
    description = _text(values, "v_dar_DataReqDescription")
    if req["requires_request_description"]:
        if not description: errors.setdefault("v_dar_DataReqDescription", []).append("Request description is required.")
        elif len(description) < DESCRIPTION_MIN: errors.setdefault("v_dar_DataReqDescription", []).append(f"Request description must be at least {DESCRIPTION_MIN} characters.")
        elif len(description) > DESCRIPTION_MAX: errors.setdefault("v_dar_DataReqDescription", []).append(f"Request description must not exceed {DESCRIPTION_MAX} characters.")
    environment = _text(values, "v_dar_environment")
    if req["requires_environment"]:
        if not environment: errors.setdefault("v_dar_environment", []).append("Environment is required.")
        elif req["supported_environments"] and environment not in req["supported_environments"]: errors.setdefault("v_dar_environment", []).append("Select a supported environment.")
    requesting = _text(values, "requesting_id") or "Me"
    values["requesting_id"] = requesting
    allowed_requesting = {"Me", "User", "Service Account"} if req["is_dataset"] else {"Me", "User"}
    if requesting not in allowed_requesting: errors.setdefault("requesting_id", []).append("Choose who this request is for.")
    elif requesting == "User" and not _text(values, "v_dar_objectid_reqfor"): errors.setdefault("v_dar_objectid_reqfor", []).append("Requested-for person is required.")
    elif requesting == "Service Account" and not _text(values, "v_dar_service_account"): errors.setdefault("v_dar_service_account", []).append("Service Account is required.")
    if req["is_dataset"] and requesting != "Service Account":
        tdsp = _text(values, "requesting_tdsp_processing") or "No"
        values["requesting_tdsp_processing"] = tdsp
        if tdsp not in {"Yes", "No"}: errors.setdefault("requesting_tdsp_processing", []).append("Select whether this request is for TDSP.")
        elif tdsp == "Yes" and not _text(values, "appropriateTDSPPod"): errors.setdefault("appropriateTDSPPod", []).append("TDSP Pod is required.")
    if req["requires_pi"]:
        if not _text(values, "v_dar_pi"): errors.setdefault("v_dar_pi", []).append("PI response is required.")
        if not _text(values, "v_dar_spi"): errors.setdefault("v_dar_spi", []).append("Sensitive PI response is required.")
        if _yes(values.get("v_dar_pi")) or _yes(values.get("v_dar_spi")):
            if not _text(values, "edm_PI_personal_details"): errors.setdefault("edm_PI_personal_details", []).append("Personal details is required.")
            if not _text(values, "v_edm_3rd_party_vendor"): errors.setdefault("v_edm_3rd_party_vendor", []).append("Third-party vendor is required.")
        if _yes(values.get("edm_PI_personal_details")) and not _text(values, "v_emd_specify_PII_needs"):
            errors.setdefault("v_emd_specify_PII_needs", []).append("Specify the PII need.")
    values["chk_dar_terms_message"] = _checked(values.get("chk_dar_terms_message"))
    if not values["chk_dar_terms_message"]: errors.setdefault("chk_dar_terms_message", []).append("Terms of Use must be accepted.")
    if definition:
        from .form_builder import apply_builder_validators
        apply_builder_validators(values, definition, req, errors)
    request_keys = {"v_dar_DataReqDescription", "v_dar_environment", "appropriateTDSPPod", "v_dar_service_account"}
    request_ok = not any(k in errors for k in request_keys)
    business_ok = "v_dar_businessJustification" not in errors
    data_ok = not any(k in errors for k in {"v_dar_pi", "v_dar_spi", "edm_PI_personal_details", "v_emd_specify_PII_needs", "v_edm_type_of_work", "v_edm_3rd_party_vendor"})
    missing = tuple(label for key, label in SECTION_LABELS.items() if not {"request_details":request_ok,"business_justification":business_ok,"data_usage":data_ok}[key])
    return CartItemValidationResult(request_ok, business_ok, data_ok, not missing and not errors, missing, errors, values)

def apply_validation(item, result):
    item.request_form_values = result.normalized_form_values
    item.request_details_complete = result.request_details_complete
    item.business_justification_complete = result.business_justification_complete
    item.data_usage_complete = result.data_usage_complete
    item.is_complete = result.is_complete
    item.missing_sections = list(result.missing_sections)
    item.validation_errors = result.field_errors
