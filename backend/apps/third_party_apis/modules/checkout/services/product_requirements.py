ALLOWED_CART_ITEM_FORM_FIELDS = frozenset({
    "requesting_tdsp_processing", "appropriateTDSPPod", "v_dar_service_account",
    "v_dar_environment", "v_dar_DataReqDescription", "v_dar_businessJustification",
    "v_emd_PI_access", "edm_PI_personal_details", "v_emd_specify_PII_needs",
    "v_edm_type_of_work", "v_edm_3rd_party_vendor", "v_dar_additionalInfoContS",
    "v_dar_questionsContS", "v_dar_reportNames", "v_dar_requestedDataContS",
    "v_dar_sourceApplications", "expected_other", "if_other_please_specify", "accessDateContS",
})

SECTION_LABELS = {
    "request_details": "Request Details",
    "business_justification": "Business Justification",
    "data_usage": "Data Usage",
}

def product_value(product, *names, default=None):
    for name in names:
        value = getattr(product, name, None)
        if value is not None: return value
    return default

def requirements_for_product(product):
    datatype = str(product_value(product, "datatype", "product_type", default="")).lower()
    access_type = str(product_value(product, "access_type", default="")).lower()
    return {
        "is_api": "api" in datatype or "api" in access_type,
        "requires_environment": bool(product_value(product, "supported_environments", "environments", default=[])),
        "supported_environments": list(product_value(product, "supported_environments", "environments", default=[]) or []),
        "requires_request_description": product_value(product, "requires_request_description", default=True) is not False,
        "requires_pi": bool(product_value(product, "pi", default=False) or product_value(product, "sensitive_pi", default=False)),
    }
