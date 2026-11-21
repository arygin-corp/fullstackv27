import re
from django.core.exceptions import ValidationError
from django.template import Context, Engine, TemplateSyntaxError
VARIABLE_RE = re.compile(r"{{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}")
BLOCK_RE = re.compile(r"{%|{#")

def used_variables(*texts):
    found=set()
    for text in texts:
        found.update(VARIABLE_RE.findall(text or ""))
    return found

def validate_template_version(version):
    texts=[version.subject_template,version.body_template,version.url_template]
    if any(BLOCK_RE.search(t or "") for t in texts):
        raise ValidationError("Template tags and comments are not permitted; only simple variables are allowed.")
    used=used_variables(*texts); allowed=set(version.template.allowed_variables or [])
    unknown=sorted(v for v in used if v.split(".")[0] not in allowed)
    if unknown: raise ValidationError(f"Unknown template variables: {', '.join(unknown)}")
    for text in texts:
        try: Engine(debug=False).from_string(text or "")
        except TemplateSyntaxError as exc: raise ValidationError(str(exc))
    return used

def render_template(version, context):
    validate_template_version(version)
    allowed=set(version.template.allowed_variables or [])
    safe={key:value for key,value in context.items() if key in allowed}
    engine=Engine(debug=False,autoescape=True)
    render=lambda text: engine.from_string(text or "").render(Context(safe,autoescape=True)).strip()
    return {"title":render(version.subject_template),"body":render(version.body_template),"url":render(version.url_template)}

def activate_version(version):
    validate_template_version(version)
    version.template.versions.filter(locale=version.locale,is_active=True).exclude(pk=version.pk).update(is_active=False)
    version.is_active=True; version.save(update_fields=["is_active"])
    version.template.status="active"; version.template.save(update_fields=["status","updated_at"])
    return version
