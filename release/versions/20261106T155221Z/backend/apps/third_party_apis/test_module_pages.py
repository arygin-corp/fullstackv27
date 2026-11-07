from django.http import Http404
from django.test import SimpleTestCase

from apps.third_party_apis.module_pages import (
    MODULE_PAGES,
    module_page_links,
    registered_module,
)
from apps.third_party_apis.registry import registry


class ModulePageTests(SimpleTestCase):
    def test_every_registered_module_has_the_standard_pages(self):
        registry.autodiscover()
        expected = [key for key, _label in MODULE_PAGES]
        self.assertEqual(
            expected,
            ["dashboard", "analytics", "health", "audit", "activity", "report"],
        )
        for module in registry.all():
            pages = module_page_links(module.key)
            self.assertEqual([page["key"] for page in pages], expected)
            for page in pages:
                self.assertIn(f"/sa/integrations/{module.key}/{page['key']}/", page["url"])

    def test_unknown_module_is_not_found(self):
        with self.assertRaises(Http404):
            registered_module("not-a-registered-module")
