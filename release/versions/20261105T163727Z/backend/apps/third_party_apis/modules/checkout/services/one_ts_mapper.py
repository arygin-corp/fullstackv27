from django.conf import settings
from .product_requirements import product_value, requirements_for_product

def snapshot_product(product):
    def simple(value):
        if hasattr(value, "value"): return value.value
        if hasattr(value, "name"): return value.name
        return value
    keys = ("id","name","classification","platform","one_ts_domain","ad_group","route_identifier","organization","access_type","data_access_type","pi","sensitive_pi","datatype","sku")
    return {k: simple(getattr(product, k, None)) for k in keys}

def build_variables(product, values, creator, requested_for, terms_accepted):
    req = requirements_for_product(product)
    one_ts_domain = product_value(product, "one_ts_domain", "domain", default="")
    control_group = getattr(one_ts_domain, "control_group", "") if one_ts_domain else ""
    ad_group = product_value(product, "ad_group", default="")
    route = product_value(product, "route_identifier", default="")
    variables = {
        "v_dar_objectid_createdby": creator.get("object_id", ""),
        "v_dar_workdayID_created_by": creator.get("workday_id", ""),
        "v_dar_objectid_reqfor": requested_for.get("object_id", ""),
        "v_dar_workdayID": requested_for.get("workday_id", ""),
        "companyName": requested_for.get("company_name", ""),
        "v_dar_dm_version": getattr(settings, "APP_VERSION", ""),
        "v_dar_product_id": str(product.pk),
        "v_dar_product_name": str(product_value(product, "name", default="")),
        "v_dar_accessReqClassification": str(product_value(product, "classification", default="")),
        "v_dar_platform": str(product_value(product, "platform", default="")),
        "v_dar_dataDomainSelect": str(one_ts_domain or ""),
        "v_custom_control_group": str(control_group or ""),
        "v_dar_ad_group": str(getattr(ad_group, "value", ad_group) or ""),
        "v_custom_routing_rule_identifier": str(getattr(route, "route_id", route) or ""),
        "v_dar_organization": str(product_value(product, "organization", "org_abbrev", default="")),
        "v_dar_accessType": str(product_value(product, "access_type", default="")),
        "v_dat_data_access_type": str(product_value(product, "data_access_type", default="")),
        "v_dar_pi": bool(product_value(product, "pi", default=False)),
        "v_dar_spi": bool(product_value(product, "sensitive_pi", default=False)),
        "chk_dar_terms_message": bool(terms_accepted),
        **values,
    }
    if req["is_api"]: variables["v_dat_api_name"] = str(product_value(product, "name", default=""))
    return {k: v for k, v in variables.items() if v not in (None, "")}
