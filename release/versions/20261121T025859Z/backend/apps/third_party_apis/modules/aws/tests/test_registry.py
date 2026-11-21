from django.test import SimpleTestCase

from ..services.registry import UnknownAWSServiceAdapter, get_adapter


class AWSServiceAdapterRegistryTests(SimpleTestCase):
    def test_all_initial_service_adapters_are_registered(self):
        expected = {
            "s3",
            "lambda",
            "dynamodb",
            "rds",
            "sqs",
            "sns",
            "eventbridge",
            "api_gateway",
            "secrets_manager",
            "kms",
            "cloudwatch",
            "athena",
            "glue",
        }
        self.assertEqual({get_adapter(key).service_key for key in expected}, expected)

    def test_unknown_adapter_raises_controlled_error(self):
        with self.assertRaises(UnknownAWSServiceAdapter):
            get_adapter("not-registered")
