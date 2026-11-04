from django.test import SimpleTestCase

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
