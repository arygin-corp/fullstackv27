from .choices import AwsEnvironment
from .models import AwsEnvironmentConfig, AwsResourceConfig


def ensure_environment_configs():
    rows = []
    for value, _label in AwsEnvironment.choices:
        obj, _ = AwsEnvironmentConfig.objects.get_or_create(environment=value)
        rows.append(obj)
    return rows


def environment_config(environment):
    ensure_environment_configs()
    return AwsEnvironmentConfig.objects.get(environment=environment)


def environment_resources(environment):
    return AwsResourceConfig.objects.filter(environment__environment=environment).select_related("environment")
