from types import SimpleNamespace
from django.test import SimpleTestCase, override_settings
from ..services.request_form_schema import build_request_form


def _product(**overrides):
    product = SimpleNamespace(
        pk=7,
        name="Sales History",
        one_ts_domain=SimpleNamespace(name="Vehicles", control_group="CG1"),
        platform=SimpleNamespace(name="API (EIG Application Support)"),
        route_identifier=SimpleNamespace(route_id="R1"),
        environment="QA",
        data_access_type="read",
        ad_group=SimpleNamespace(name="Sales AD", value="sales-ad"),
        classification=SimpleNamespace(name="Confidential", value="Confidential"),
        control_group=None,
    )
    for key, value in overrides.items():
        setattr(product, key, value)
    return product


def _creator(company="AIR"):
    return {"object_id": "oid-1", "company_name": company}


def _field(form, name):
    for section in form["sections"]:
        for field in section["fields"]:
            if field["name"] == name:
                return field
    raise AssertionError(name)


@override_settings(APP_VERSION="26.27.10")
class RequestFormSchemaTests(SimpleTestCase):
    def test_product_values_are_filled(self):
        form = build_request_form(_product(), _creator())
        self.assertEqual(form["product_id"], 7)
        self.assertEqual(form["values"]["v_dar_product_name"], "Sales History")
        self.assertNotIn("radar_productname", form["values"])
        self.assertEqual(form["values"]["v_dar_dm_version"], "Version 26.27.10")
        self.assertEqual(form["values"]["v_dar_objectid_createdby"], "oid-1")
        self.assertEqual(form["values"]["v_dar_dataDomainSelect"], "Vehicles")
        self.assertEqual(form["values"]["v_custom_control_group"], "CG1")

    def test_alternate_approver_replaces_domain_control_group(self):
        form = build_request_form(
            _product(alt_approver=SimpleNamespace(name="Finance Approver", sys_id="abc123sysid")),
            _creator(),
        )
        self.assertEqual(form["values"]["v_dar_dataDomainSelect"], "Vehicles")
        self.assertEqual(form["values"]["v_custom_control_group"], "abc123sysid")
        self.assertNotEqual(form["values"]["v_custom_control_group"], "CG1")
        self.assertEqual(form["values"]["v_custom_routing_rule_identifier"], "R1")
        self.assertEqual(form["values"]["v_dar_ad_group"], "sales-ad")
        self.assertEqual(form["values"]["v_dar_environment"], "QA")
        self.assertEqual(form["values"]["v_dar_organization"], "Toyota Motor North America")
        self.assertEqual(form["values"]["v_dar_userType"], "TMNAUsers")

    def test_platform_show_hide_matches_template(self):
        api = build_request_form(_product(), _creator())
        self.assertTrue(_field(api, "v_dat_api_name")["visible"])
        self.assertFalse(_field(api, "v_dar_OtherType")["visible"])
        self.assertFalse(_field(api, "v_dar_post_table_names")["visible"])

        other = build_request_form(_product(platform=SimpleNamespace(name="Other")), _creator())
        self.assertTrue(_field(other, "v_dar_OtherType")["visible"])
        self.assertFalse(_field(other, "v_dat_api_name")["visible"])

        tbdp_name = "TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)"
        tbdp = build_request_form(_product(platform=SimpleNamespace(name=tbdp_name)), _creator())
        self.assertTrue(_field(tbdp, "v_dar_post_database_schema")["visible"])
        self.assertTrue(_field(tbdp, "v_dar_post_table_names")["visible"])

    def test_public_classification_locks_intended_use(self):
        form = build_request_form(
            _product(classification=SimpleNamespace(name="Public", value="Public")),
            _creator(),
            saved_values={"v_dar_businessJustification": "This should not replace the public message."},
        )
        field = _field(form, "v_dar_businessJustification")
        self.assertTrue(field["visible"])
        self.assertTrue(field["disabled"])
        self.assertIn("not required", field["value"])
        self.assertTrue(_field(form, "v_dar_pi")["visible"])
        self.assertTrue(_field(form, "v_dar_spi")["visible"])
        self.assertEqual(_field(form, "v_dar_spi")["label"], "Are you requesting for any Sensitive Personal Information (SPI) data?")
        self.assertFalse(_field(form, "edm_PI_personal_details")["visible"])

    def test_restricted_classification_keeps_saved_intended_use(self):
        form = build_request_form(
            _product(),
            _creator(),
            saved_values={"v_dar_businessJustification": "Need this data for the weekly sales review."},
            line_key="abc",
            revision=3,
        )
        field = _field(form, "v_dar_businessJustification")
        self.assertFalse(field["disabled"])
        self.assertEqual(field["value"], "Need this data for the weekly sales review.")
        self.assertEqual(form["line_key"], "abc")
        self.assertEqual(form["revision"], 3)

    def test_pi_followups_follow_answers(self):
        form = build_request_form(
            _product(),
            _creator(),
            saved_values={"v_dar_pi": "No", "v_dar_spi": "Yes", "edm_PI_personal_details": "Yes", "requesting_id": "User"},
        )
        self.assertTrue(_field(form, "edm_PI_personal_details")["visible"])
        self.assertTrue(_field(form, "v_emd_specify_PII_needs")["visible"])
        self.assertTrue(_field(form, "v_edm_type_of_work")["visible"])
        self.assertTrue(_field(form, "v_edm_3rd_party_vendor")["visible"])
        self.assertTrue(_field(form, "v_dar_objectid_reqfor")["visible"])

    def test_unknown_company_hides_organization(self):
        form = build_request_form(_product(), _creator(company="UNKNOWN"))
        self.assertFalse(_field(form, "v_dar_organization")["visible"])
        self.assertFalse(_field(form, "v_dar_userType")["visible"])
        self.assertEqual(form["values"]["v_dar_organization"], "")

    def test_dataset_ad_group_label_follows_request_type(self):
        product = _product(datatype=SimpleNamespace(name="Datasets"))
        standard = build_request_form(product, _creator())
        field = _field(standard, "v_dar_ad_group")
        self.assertTrue(field["visible"])
        self.assertTrue(field["disabled"])
        self.assertEqual(field["label"], "AD Group")
        self.assertEqual(field["value"], "sales-ad")

        service = build_request_form(product, _creator(), saved_values={"requesting_id": "Service Account"})
        self.assertEqual(_field(service, "v_dar_ad_group")["label"], "Service Account AD Group")

        tdsp = build_request_form(product, _creator(), saved_values={"requesting_tdsp_processing": "Yes"})
        self.assertEqual(_field(tdsp, "v_dar_ad_group")["label"], "TDSP AD Group")

        other = build_request_form(_product(), _creator())
        self.assertFalse(_field(other, "v_dar_ad_group")["visible"])
