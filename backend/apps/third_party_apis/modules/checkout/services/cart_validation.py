from dataclasses import dataclass
from .product_requirements import ALLOWED_CART_ITEM_FORM_FIELDS, SECTION_LABELS, requirements_for_product

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

def validate_cart_item(product, submitted_values):
    unexpected = sorted(set(submitted_values) - ALLOWED_CART_ITEM_FORM_FIELDS)
    if unexpected:
        return CartItemValidationResult(False, False, False, False, tuple(SECTION_LABELS.values()), {"form_values": [f"Unexpected fields: {', '.join(unexpected)}"]}, {})
    values = {k: v.strip() if isinstance(v, str) else v for k, v in submitted_values.items() if k in ALLOWED_CART_ITEM_FORM_FIELDS}
    req = requirements_for_product(product); errors = {}
    business = _text(values, "v_dar_businessJustification")
    if len(business) < 20: errors.setdefault("v_dar_businessJustification", []).append("Business justification must be at least 20 characters.")
    if len(business) > 4000: errors.setdefault("v_dar_businessJustification", []).append("Business justification must not exceed 4000 characters.")
    if req["requires_request_description"] and not _text(values, "v_dar_DataReqDescription"):
        errors.setdefault("v_dar_DataReqDescription", []).append("Request description is required.")
    environment = _text(values, "v_dar_environment")
    if req["requires_environment"]:
        if not environment: errors.setdefault("v_dar_environment", []).append("Environment is required.")
        elif req["supported_environments"] and environment not in req["supported_environments"]: errors.setdefault("v_dar_environment", []).append("Select a supported environment.")
    if _yes(values.get("requesting_tdsp_processing")) and not _text(values, "appropriateTDSPPod"):
        errors.setdefault("appropriateTDSPPod", []).append("TDSP Pod is required.")
    if req["requires_pi"]:
        if not _text(values, "v_emd_PI_access"): errors.setdefault("v_emd_PI_access", []).append("PI access response is required.")
        if _yes(values.get("v_emd_PI_access")):
            for key, label in (("edm_PI_personal_details", "Personal details"), ("v_edm_type_of_work", "Type of work"), ("v_edm_3rd_party_vendor", "Third-party vendor")):
                if not _text(values, key): errors.setdefault(key, []).append(f"{label} is required.")
        if _yes(values.get("edm_PI_personal_details")) and not _text(values, "v_emd_specify_PII_needs"):
            errors.setdefault("v_emd_specify_PII_needs", []).append("Specify the PII need.")
    request_keys = {"v_dar_DataReqDescription", "v_dar_environment", "appropriateTDSPPod", "v_dar_service_account"}
    request_ok = not any(k in errors for k in request_keys)
    business_ok = "v_dar_businessJustification" not in errors
    data_ok = not any(k in errors for k in {"v_emd_PI_access", "edm_PI_personal_details", "v_emd_specify_PII_needs", "v_edm_type_of_work", "v_edm_3rd_party_vendor"})
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
