PUBLIC_CLASSIFICATIONS = ("Public", "Protected")
RESTRICTED_CLASSIFICATIONS = (
    "Confidential",
    "Highly Confidential",
    "Personal Information",
    "Legal/Privileged",
)
CLASSIFICATIONS = PUBLIC_CLASSIFICATIONS + RESTRICTED_CLASSIFICATIONS
PUBLIC_INTENDED_USE = (
    "Intended Use is not required for products with a Data Classification of Public or Protected"
)
INTENDED_USE_MIN = 25
INTENDED_USE_MAX = 4000
DESCRIPTION_MIN = 5
DESCRIPTION_MAX = 4000

# Every value the request-access form can submit, including disabled product fields.
RENDERED_FORM_FIELDS = frozenset({
    "v_dar_product_name", "v_dar_dm_version",
    "v_dar_objectid_createdby", "requesting_id", "v_dar_objectid_reqfor",
    "companyName", "v_dar_organization", "v_dar_userType", "v_dar_accessType",
    "v_dar_dataDomainSelect", "v_custom_control_group", "v_dar_platform",
    "v_dar_OtherType", "v_dat_api_name", "v_dar_post_database_schema",
    "v_dar_post_table_names", "v_custom_routing_rule_identifier",
    "v_dar_tbdp_is_this_request_fort_irm_pricing", "v_dar_environment",
    "v_dat_data_access_type", "v_dar_databaseName", "v_dar_ad_group",
    "v_dar_accessReqClassification", "v_dar_DataReqDescription",
    "v_dar_businessJustification", "v_dar_pi", "v_dar_spi", "edm_PI_personal_details",
    "v_emd_specify_PII_needs", "v_edm_type_of_work", "v_edm_3rd_party_vendor",
    "chk_dar_terms_message",
})

ALLOWED_CART_ITEM_FORM_FIELDS = RENDERED_FORM_FIELDS | frozenset({
    "requesting_tdsp_processing", "appropriateTDSPPod", "v_dar_service_account",
    "v_dar_additionalInfoContS", "v_dar_questionsContS", "v_dar_reportNames",
    "v_dar_requestedDataContS", "v_dar_sourceApplications", "expected_other",
    "if_other_please_specify", "accessDateContS",
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

def datatype_name(product):
    value = product_value(product, "datatype", "product_type", default=None)
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    for attr in ("name", "value"):
        found = getattr(value, attr, None)
        if found:
            return str(found)
    return str(value)

def classification_name(product):
    value = product_value(product, "classification", default=None)
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    for attr in ("name", "value"):
        found = getattr(value, attr, None)
        if found:
            return str(found)
    return ""

def requirements_for_product(product):
    datatype = str(product_value(product, "datatype", "product_type", default="")).lower()
    access_type = str(product_value(product, "access_type", default="")).lower()
    classification = classification_name(product)
    datatype_label = datatype_name(product)
    return {
        "is_api": "api" in datatype or "api" in access_type,
        "datatype": datatype_label,
        "is_dataset": datatype_label.strip().lower() == "datasets",
        "classification": classification,
        "requires_environment": bool(product_value(product, "supported_environments", "environments", default=[])),
        "supported_environments": list(product_value(product, "supported_environments", "environments", default=[]) or []),
        "requires_request_description": product_value(product, "requires_request_description", default=True) is not False,
        "requires_pi": classification in CLASSIFICATIONS,
    }
