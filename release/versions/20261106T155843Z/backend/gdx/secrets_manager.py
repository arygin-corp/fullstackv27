import json
import os
import boto3
from botocore.exceptions import ClientError

def load_aws_secrets(secret_name="nonprod/gdx/secrets", region_name="us-west-2"):
    """
    Fetches secrets from AWS Secrets Manager and injects them into os.environ.
    """
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # In local development, you might not have AWS access.
        # We print a warning but allow the app to continue (using .env files).
        print(f"Could not fetch AWS secrets: {e}")
        return

    # Secrets Manager can return secrets as a string or binary.
    if 'SecretString' in get_secret_value_response:
        secret_payload = get_secret_value_response['SecretString']
        try:
            secrets = json.loads(secret_payload)
            # Inject into os.environ so django-environ's env() can find them
            for key, value in secrets.items():
                os.environ.setdefault(key, str(value))
        except json.JSONDecodeError:
            # If the secret is a plain string, you might handle it differently
            os.environ.setdefault("AWS_SECRET_VALUE", secret_payload)