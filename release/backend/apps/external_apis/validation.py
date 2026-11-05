import json
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import SchemaError
from .exceptions import ExternalApiConfigurationError
from .models import APIParameter

def validate_json_schema(instance, schema, label):
    if not schema: return
    try: validator = Draft202012Validator(schema, format_checker=FormatChecker())
    except SchemaError as exc: raise ExternalApiConfigurationError(f"Invalid {label} schema: {exc.message}") from exc
    errors = sorted(validator.iter_errors(instance), key=lambda e: list(e.absolute_path))
    if errors:
        raise ValueError({label: [f"{'.'.join(map(str,e.absolute_path)) or '$'}: {e.message}" for e in errors[:10]]})

def validate_and_map_parameters(config, supplied, location):
    supplied = dict(supplied or {})
    definitions = {p.key:p for p in config.parameters.all() if p.active and p.client_supplied and p.location == location}
    unknown = sorted(set(supplied)-set(definitions))
    if unknown: raise ValueError({location:[f"Unsupported parameter: {k}" for k in unknown]})
    mapped={}; errors=[]
    for key,p in definitions.items():
        value = supplied.get(key, p.default_value)
        if value in (None, ""):
            if p.required: errors.append(f"{key} is required")
            continue
        try:
            if p.data_type == APIParameter.DataType.INTEGER: value=int(value)
            elif p.data_type == APIParameter.DataType.NUMBER: value=float(value)
            elif p.data_type == APIParameter.DataType.BOOLEAN:
                value={"true":True,"1":True,"false":False,"0":False}[str(value).casefold()]
            elif p.data_type in (APIParameter.DataType.ARRAY, APIParameter.DataType.OBJECT) and isinstance(value,str): value=json.loads(value)
            validate_json_schema(value,p.validation_schema,f"parameter.{key}")
            mapped[p.upstream_name or key]=value
        except (TypeError,ValueError,KeyError,json.JSONDecodeError) as exc: errors.append(f"{key}: {exc}")
    if errors: raise ValueError({location:errors})
    return mapped
