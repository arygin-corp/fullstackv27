from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from .services.dar_form_builder import export_definition, refresh_labels, validate_document
from .services.marketplace_choices import apply_marketplace_choices
from .services.schema_builder import validate_schema


class FormSchemaValidationTests(SimpleTestCase):
    def test_minimal_schema_is_valid(self):
        schema = {
            "fields": [
                {
                    "key": "request_reason",
                    "type": "textarea",
                    "label": "Request reason",
                    "options": [],
                }
            ],
            "rules": [],
        }
        self.assertEqual(validate_schema(schema), [])


class DarFormBuilderTests(SimpleTestCase):
    def test_export_includes_the_request_form_and_an_empty_section_for_new_fields(self):
        document = export_definition()
        names = [field["name"] for section in document["sections"] for field in section["fields"]]
        self.assertIn("v_dar_platform", names)
        labels = {field["name"]: field["label"] for section in document["sections"] for field in section["fields"]}
        self.assertEqual(labels["v_dar_platform"], "Platform")
        platform = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_platform")
        self.assertEqual(platform["type"], "select")
        self.assertIn("API (EIG Application Support)", [option["value"] for option in platform["options"]])
        self.assertIn("My SQL", [option["value"] for option in platform["options"]])
        self.assertIn("Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)", [option["value"] for option in platform["options"]])
        self.assertNotIn("v_dar_analytics_platform", names)
        grant = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "b_dar_mf_db2_grant")
        self.assertEqual(grant["type"], "checkbox")
        person = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_objectid_reqfor")
        self.assertEqual(person["options_source"], "/api/integrations/people-finder/search/gac/user/")
        api_name = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dat_api_name")
        self.assertEqual(api_name["visible_when"], {"field": "v_dar_platform", "equals": "API (EIG Application Support)"})
        self.assertIsNone(next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_platform")["visible_when"])
        self.assertEqual(labels["v_dar_dm_version"], "Build Version")
        self.assertEqual(labels["v_dar_DataReqDescription"], "Data Request Description")
        self.assertEqual(labels["v_dar_pi"], "Are you requesting Personal Information (PI) data?")
        self.assertEqual(labels["v_dar_spi"], "Are you requesting Sensitive Personal Information (Sensitive PI) data?")
        self.assertNotIn("v_emd_PI_access", names)
        pi = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_pi")
        self.assertEqual(pi["type"], "select")
        self.assertEqual([option["value"] for option in pi["options"]], ["Yes", "No"])
        personal = next(section for section in document["sections"] if any(field["name"] == "v_dar_pi" for field in section["fields"]))
        personal_names = [field["name"] for field in personal["fields"]]
        self.assertLess(personal_names.index("v_dar_pi"), personal_names.index("v_dar_spi"))
        either_yes = {"any": [{"field": "v_dar_pi", "equals": "Yes"}, {"field": "v_dar_spi", "equals": "Yes"}]}
        for follow_up in ("edm_PI_personal_details", "v_edm_type_of_work", "v_edm_3rd_party_vendor"):
            field = next(item for section in document["sections"] for item in section["fields"] if item["name"] == follow_up)
            self.assertEqual(field["visible_when"], either_yes)
        self.assertEqual(labels["chk_dar_terms_message"], "I have read and accepted the Terms of Use")
        description = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_DataReqDescription")
        intended = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_businessJustification")
        self.assertEqual(description["type"], "textarea")
        self.assertEqual(intended["type"], "textarea")
        self.assertEqual(description["min_length"], 10)
        self.assertEqual(intended["label"], "Intended Use")
        terms = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "chk_dar_terms_message")
        self.assertEqual(terms["type"], "checkbox")
        self.assertIn("a. I am authorized to use this data solely to perform my job duties.", terms["content"])
        self.assertTrue(any("https://dataenablement.toyota.com/" in line for line in terms["content"]))
        route = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_custom_routing_rule_identifier")
        self.assertTrue(route["disabled"])
        self.assertEqual(route["label"], "Route Identifier")
        route_values = {(item["when"]["equals"], item["value"]) for item in route["value_when"] if item["when"].get("field") == "v_dar_platform"}
        self.assertIn(("My SQL", "10"), route_values)
        self.assertIn(("API (EIG Application Support)", "4"), route_values)
        group = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_custom_fulfillment_group_1")
        self.assertTrue(any(item["value"] == "4942f1a70f92bd404758e388b1050e2b" for item in group["value_when"]))
        self.assertEqual(group["label"], "Fulfillment Group")
        self.assertNotEqual(labels["v_dar_organization"], "User Type")
        self.assertEqual(document["sections"][-1]["key"], "additional")
        self.assertEqual(document["sections"][-1]["fields"], [])
        by_name = {field["name"]: section["label"] for section in document["sections"] for field in section["fields"]}
        self.assertEqual(by_name["requesting_id"], "Requesting access")
        self.assertEqual(by_name["v_dar_platform"], "Platform")
        self.assertEqual(by_name["v_dat_api_name"], "API")
        self.assertEqual(by_name["v_dar_userType"], "User type")

    def test_a_new_field_needs_a_name_the_form_can_bind(self):
        document = export_definition()
        document["sections"][-1]["fields"].append({
            "name": "cost center",
            "label": "Cost center",
            "type": "text",
            "options": [],
        })
        with self.assertRaises(ValidationError):
            validate_document(document)

    def test_a_new_field_can_be_added(self):
        document = export_definition()
        document["sections"][-1]["fields"].append({
            "name": "cost_center",
            "label": "Cost center",
            "type": "text",
            "required": True,
            "options": [],
            "validators": [{"type": "required", "message": "Enter a cost center.", "enforced": True}],
        })
        self.assertEqual(validate_document(document)["sections"][-1]["fields"][0]["name"], "cost_center")

    def test_saved_documents_keep_a_label_the_user_wrote(self):
        document = export_definition()
        document["sections"][0]["fields"][0]["label"] = "Custom requester"
        refresh_labels(document)
        self.assertEqual(document["sections"][0]["fields"][0]["label"], "Custom requester")

    def test_generated_labels_are_replaced_with_the_form_labels(self):
        document = export_definition()
        field = next(item for section in document["sections"] for item in section["fields"] if item["name"] == "v_dar_dm_version")
        field["label"] = "v dar dm version"
        refresh_labels(document)
        self.assertEqual(field["label"], "Build Version")

    def test_marketplace_platform_choices_are_replaced_with_the_request_form(self):
        document = export_definition()
        platform = next(field for section in document["sections"] for field in section["fields"] if field["name"] == "v_dar_platform")
        platform["options_source"] = "marketplace:platform"
        platform["options"] = [
            {"value": "API (EIG Application Support)", "label": "API (EIG Application Support)"},
            {"value": "Other", "label": "Other"},
            {"value": "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)", "label": "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"},
        ]
        refresh_labels(document)
        values = [option["value"] for option in platform["options"]]
        self.assertIn("PostgreSQL", values)
        self.assertIn("Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)", values)
        self.assertEqual(platform["options_source"], "")


class MarketplaceChoiceTests(SimpleTestCase):
    def _document(self):
        return {"sections": [{"fields": [
            {"name": "v_dar_platform", "type": "select", "options": [{"value": "Old", "label": "Old"}], "options_source": ""},
            {"name": "v_dar_dataDomainSelect", "type": "select", "options": [], "options_source": ""},
            {"name": "v_dar_organization", "type": "text", "options": [], "options_source": ""},
            {"name": "v_dar_objectid_reqfor", "type": "text", "options": [], "options_source": "/api/integrations/people-finder/search/gac/user/"},
        ]}]}

    def test_a_marketplace_source_is_used_only_when_the_field_asks_for_it(self):
        document = self._document()
        document["sections"][0]["fields"][0]["options_source"] = "marketplace:platform"
        with patch("apps.forms.services.marketplace_choices.choices_for", side_effect=lambda source: [{"value": source, "label": source.title()}]):
            apply_marketplace_choices(document)
        fields = document["sections"][0]["fields"]
        self.assertEqual(fields[0]["options_source"], "marketplace:platform")
        self.assertEqual(fields[0]["options"][0]["value"], "platform")
        self.assertEqual(fields[1]["options_source"], "")
        self.assertEqual(fields[2]["type"], "text")
        self.assertIn("people-finder", fields[3]["options_source"])

    def test_an_empty_catalog_leaves_the_current_choices(self):
        document = self._document()
        with patch("apps.forms.services.marketplace_choices.choices_for", return_value=[]):
            apply_marketplace_choices(document)
        platform = document["sections"][0]["fields"][0]
        self.assertEqual(platform["options"][0]["value"], "Old")
        self.assertEqual(platform["options_source"], "")
