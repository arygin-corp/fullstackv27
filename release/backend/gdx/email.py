import os

from django.core.mail.backends.base import BaseEmailBackend

from gdx.britive import boto3_client


class SesEmailBackend(BaseEmailBackend):
    """Send Django email through Amazon SES with the instance role."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.region = os.getenv("AWS_SES_REGION") or os.getenv("AWS_REGION") or "us-west-2"
        self._client = None

    def client(self):
        if self._client is None:
            self._client = boto3_client("ses", self.region)
        return self._client

    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        sent = 0
        for message in email_messages:
            try:
                payload = {
                    "Source": message.from_email,
                    "Destinations": message.recipients(),
                    "RawMessage": {"Data": message.message().as_bytes()},
                }
                configuration_set = os.getenv("AWS_SES_CONFIGURATION_SET", "")
                if configuration_set:
                    payload["ConfigurationSetName"] = configuration_set
                self.client().send_raw_email(**payload)
                sent += 1
            except Exception:
                if not self.fail_silently:
                    raise
        return sent
