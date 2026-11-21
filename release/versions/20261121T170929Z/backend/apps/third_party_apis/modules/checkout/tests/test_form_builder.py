from types import SimpleNamespace
from django.test import SimpleTestCase

from ..services.cart_validation import validate_cart_item
from ..services.form_builder import apply_builder_validators, export_definition, validate_document
from ..services.request_form_schema import build_request_form


class FormBuilderTests(SimpleTestCase):
    def test_export_includes_rules_and_seeded_validators(self):
        document = export_definition()
        names = [field["name"] for section in document["sections"] for field in section["fields"]]
        self.assertIn("requesting_id", names)
        self.assertIn("v_dar_ad_group", names)
        ad_group = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_ad_group")
        self.assertTrue(ad_group["label_when"])
        intended = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_businessJustification")
        self.assertEqual(intended["validators"][0]["type"], "min_length")
        self.assertFalse(intended["validators"][0]["enforced"])

    def test_saved_document_changes_the_rendered_label(self):
        document = export_definition()
        for section in document["sections"]:
            for field in section["fields"]:
                if field["name"] == "requesting_id":
                    field["label"] = "Requesting for"
        product = SimpleNamespace(
            pk=1, name="Sales", one_ts_domain=None, platform=None, route_identifier=None,
            environment="Prod", data_access_type="read", ad_group=None,
            classification=SimpleNamespace(name="Confidential", value="Confidential"),
            datatype=SimpleNamespace(name="Datasets"), control_group=None,
        )
        form = build_request_form(product, {"object_id": "oid", "company_name": "AIR"}, definition=document)
        field = next(item for section in form["sections"] for item in section["fields"] if item["name"] == "requesting_id")
        self.assertEqual(field["label"], "Requesting for")

    def test_enforced_validator_runs_on_checkout_validation(self):
        document = {"sections": [{"key": "custom", "label": "Custom", "fields": [
            {"name": "desk_location", "label": "Desk", "type": "text", "validators": [
                {"type": "required", "message": "Desk is required.", "enforced": True},
            ]},
        ]}]}
        errors = {}
        apply_builder_validators({}, document, {}, errors)
        self.assertEqual(errors["desk_location"], ["Desk is required."])
        product = SimpleNamespace(requires_request_description=False, pi=False, sensitive_pi=False, supported_environments=[])
        result = validate_cart_item(product, {
            "v_dar_businessJustification": "x" * 25,
            "chk_dar_terms_message": True,
            "desk_location": "",
        }, definition=document)
        self.assertIn("Desk is required.", result.field_errors["desk_location"])

    def test_document_rejects_duplicate_fields(self):
        errors = validate_document({"sections": [{"key": "a", "label": "A", "fields": [
            {"name": "same", "type": "text"},
            {"name": "same", "type": "text"},
        ]}]})
        self.assertTrue(errors)
