from types import SimpleNamespace
from django.test import SimpleTestCase
from ..module import Module
from ..services.cart_validation import validate_cart_item
from ..services.request_form_schema import build_request_form

def _requesting_options(form):
    for section in form["sections"]:
        for field in section["fields"]:
            if field["name"] == "requesting_id":
                return [option["value"] for option in field["options"] if option.get("visible", True)]
    return []

def _product(classification="Confidential"):
    return SimpleNamespace(
        pk=7, name="Sales History", requires_request_description=True,
        pi=False, sensitive_pi=False, supported_environments=[],
        classification=SimpleNamespace(name=classification, value=classification),
        one_ts_domain=SimpleNamespace(name="Vehicles", control_group="CG1"),
        platform=SimpleNamespace(name="Other"), environment="Prod", data_access_type="read",
        ad_group=SimpleNamespace(value="sales-ad"), route_identifier=SimpleNamespace(route_id="R1"),
    )

class ValidationTests(SimpleTestCase):
    def test_invalid_form_remains_incomplete(self):
        result = validate_cart_item(SimpleNamespace(requires_request_description=True, pi=False, sensitive_pi=False, supported_environments=[]), {})
        self.assertFalse(result.is_complete)
        self.assertIn("Business Justification", result.missing_sections)

    def test_unexpected_fields_rejected(self):
        result = validate_cart_item(SimpleNamespace(requires_request_description=False, pi=False, sensitive_pi=False, supported_environments=[]), {"product_name": "override", "v_dar_businessJustification": "x" * 30})
        self.assertIn("form_values", result.field_errors)

    def test_rendered_form_values_are_accepted(self):
        product = _product()
        form = build_request_form(product, {"object_id": "oid-1", "company_name": "AIR"})
        values = dict(form["values"])
        values.update({
            "v_dar_businessJustification": "Need this for the weekly sales review.",
            "v_dar_pi": "No",
            "v_dar_spi": "No",
            "chk_dar_terms_message": True,
            "requesting_id": "Me",
        })
        result = validate_cart_item(product, values)
        self.assertNotIn("form_values", result.field_errors)
        self.assertTrue(result.is_complete, result.field_errors)

    def test_classification_requires_pi_answer(self):
        product = _product("Public")
        result = validate_cart_item(product, {
            "v_dar_DataReqDescription": "Sales History",
            "v_dar_businessJustification": "short",
            "chk_dar_terms_message": True,
        })
        self.assertIn("v_dar_pi", result.field_errors)
        self.assertIn("v_dar_spi", result.field_errors)
        self.assertLessEqual(len("short"), 200)

    def test_intended_use_follows_template_length(self):
        product = _product()
        base = {"v_dar_DataReqDescription": "Sales History", "v_dar_pi": "No", "v_dar_spi": "No", "chk_dar_terms_message": True}
        short = validate_cart_item(product, {**base, "v_dar_businessJustification": "x" * 24})
        self.assertIn("v_dar_businessJustification", short.field_errors)
        ok = validate_cart_item(product, {**base, "v_dar_businessJustification": "x" * 25})
        self.assertNotIn("v_dar_businessJustification", ok.field_errors)
        long = validate_cart_item(product, {**base, "v_dar_businessJustification": "x" * 4001})
        self.assertIn("v_dar_businessJustification", long.field_errors)
        short_description = validate_cart_item(product, {**base, "v_dar_DataReqDescription": "Sale", "v_dar_businessJustification": "x" * 25})
        self.assertIn("v_dar_DataReqDescription", short_description.field_errors)

    def test_pi_or_spi_yes_requires_followups(self):
        product = _product()
        base = {"v_dar_DataReqDescription": "Sales History", "v_dar_businessJustification": "x" * 25, "chk_dar_terms_message": True, "v_dar_pi": "No", "v_dar_spi": "Yes"}
        missing = validate_cart_item(product, base)
        self.assertIn("edm_PI_personal_details", missing.field_errors)
        self.assertIn("v_edm_3rd_party_vendor", missing.field_errors)
        explained = validate_cart_item(product, {**base, "edm_PI_personal_details": "Yes", "v_edm_3rd_party_vendor": "No"})
        self.assertIn("v_emd_specify_PII_needs", explained.field_errors)

    def test_service_account_is_only_valid_for_datasets(self):
        payload = {"v_dar_DataReqDescription": "Sales History", "v_dar_businessJustification": "x" * 25, "v_dar_pi": "No", "v_dar_spi": "No", "chk_dar_terms_message": True, "requesting_id": "Service Account"}
        rejected = validate_cart_item(_product(), payload)
        self.assertIn("requesting_id", rejected.field_errors)
        dataset = _product()
        dataset.datatype = SimpleNamespace(name="Datasets")
        accepted = validate_cart_item(dataset, payload)
        self.assertNotIn("requesting_id", accepted.field_errors)
        self.assertIn("v_dar_service_account", accepted.field_errors)

    def test_dataset_tdsp_requires_a_pod_when_yes(self):
        dataset = _product()
        dataset.datatype = SimpleNamespace(name="Datasets")
        base = {"v_dar_DataReqDescription": "Sales History", "v_dar_businessJustification": "x" * 25, "v_dar_pi": "No", "v_dar_spi": "No", "chk_dar_terms_message": True, "requesting_id": "Me", "requesting_tdsp_processing": "Yes"}
        missing = validate_cart_item(dataset, base)
        self.assertIn("appropriateTDSPPod", missing.field_errors)
        service_account = validate_cart_item(dataset, {**base, "requesting_id": "Service Account", "v_dar_service_account": "svc-tdsp", "requesting_tdsp_processing": ""})
        self.assertNotIn("appropriateTDSPPod", service_account.field_errors)
        self.assertNotIn("requesting_tdsp_processing", service_account.field_errors)
        form = build_request_form(dataset, {"object_id": "oid-1", "company_name": "AIR"})
        options = _requesting_options(form)
        self.assertIn("Service Account", options)

class CheckoutModuleCardTests(SimpleTestCase):
    def test_card_metadata_points_at_checkout(self):
        module = Module()
        self.assertEqual(module.public_endpoint(), "/api/marketplace/cart/checkout/")
        self.assertEqual(module.frontend_method, "POST")
        self.assertEqual(module.frontend_authentication, "Django authentication")
        labels = [field["label"] for field in module.presentation["card"]["fields"]]
        self.assertEqual(labels, ["Endpoint", "Method", "Auth Type", "Last Sync"])
        names = [endpoint["name"] for endpoint in module.endpoints]
        self.assertIn("Product request form", names)
        self.assertIn("Save cart item request form", names)
