import logging
import secrets
import string

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
client = boto3.client("secretsmanager")


def lambda_handler(event, context):
    secret_id = event["SecretId"]
    token = event["ClientRequestToken"]
    step = event["Step"]

    metadata = client.describe_secret(SecretId=secret_id)
    if not metadata.get("RotationEnabled"):
        raise ValueError(f"Secret {secret_id} is not enabled for rotation")

    versions = metadata["VersionIdsToStages"]
    if token not in versions:
        raise ValueError(f"Secret version {token} has no stage for rotation of secret {secret_id}")
    if "AWSCURRENT" in versions[token]:
        logger.info("Version %s is already current for %s", token, secret_id)
        return
    if "AWSPENDING" not in versions[token]:
        raise ValueError(f"Secret version {token} is not AWSPENDING for secret {secret_id}")

    if step == "createSecret":
        create_secret(secret_id, token)
    elif step == "setSecret":
        logger.info("Django secret %s has no external service to update", secret_id)
    elif step == "testSecret":
        test_secret(secret_id, token)
    elif step == "finishSecret":
        finish_secret(secret_id, token)
    else:
        raise ValueError(f"Invalid rotation step {step}")


def create_secret(secret_id, token):
    client.get_secret_value(SecretId=secret_id, VersionStage="AWSCURRENT")
    try:
        client.get_secret_value(SecretId=secret_id, VersionId=token, VersionStage="AWSPENDING")
        logger.info("Pending version already exists for %s", secret_id)
        return
    except client.exceptions.ResourceNotFoundException:
        pass

    alphabet = string.ascii_letters + string.digits
    password = "".join(secrets.choice(alphabet) for _ in range(64))
    client.put_secret_value(
        SecretId=secret_id,
        ClientRequestToken=token,
        SecretString=password,
        VersionStages=["AWSPENDING"],
    )
    logger.info("Created pending Django secret for %s", secret_id)


def test_secret(secret_id, token):
    pending = client.get_secret_value(SecretId=secret_id, VersionId=token, VersionStage="AWSPENDING")
    if not pending.get("SecretString"):
        raise ValueError(f"Pending secret for {secret_id} is empty")


def finish_secret(secret_id, token):
    metadata = client.describe_secret(SecretId=secret_id)
    current = None
    for version, stages in metadata["VersionIdsToStages"].items():
        if "AWSCURRENT" in stages:
            if version == token:
                return
            current = version
            break
    client.update_secret_version_stage(
        SecretId=secret_id,
        VersionStage="AWSCURRENT",
        MoveToVersionId=token,
        RemoveFromVersionId=current,
    )
    logger.info("Finished rotation for %s", secret_id)
