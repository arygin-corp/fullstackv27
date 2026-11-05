"""Marketplace catalogs that fill Data Access Request select fields."""
from django.db.utils import OperationalError, ProgrammingError

PREFIX = "marketplace:"
SOURCE_KEYS = (
    "platform",
    "domain",
    "subdomain",
    "subdomain_level_3",
    "datatype",
    "classification",
    "catalog",
    "organization",
    "company",
    "one_ts_domain",
    "ad_group",
    "fulfillment_team",
    "badge",
    "keyword",
    "attribute",
    "data_steward",
    "contact",
    "product",
)

def _models():
    from apps.marketplace.models import (
        ADGroup,
        Attribute,
        Badge,
        Catalog,
        Classification,
        Company,
        Contact,
        DataSteward,
        Datatype,
        Domain,
        FulfillmentTeam,
        Keyword,
        OneTSDomain,
        Organization,
        Platform,
        Product,
        SubDomain_1,
        SubDomain_2,
    )

    return {
        "platform": ("Platforms", Platform.objects.all()),
        "domain": ("Data domains", Domain.objects.all()),
        "subdomain": ("Data domains, level 2", SubDomain_1.objects.all()),
        "subdomain_level_3": ("Data domains, level 3", SubDomain_2.objects.all()),
        "datatype": ("Data types", Datatype.objects.all()),
        "classification": ("Classifications", Classification.objects.all()),
        "catalog": ("Catalogs", Catalog.objects.all()),
        "organization": ("Organizations", Organization.objects.all()),
        "company": ("Companies", Company.objects.all()),
        "one_ts_domain": ("One TS domains", OneTSDomain.objects.all()),
        "ad_group": ("AD groups", ADGroup.objects.all()),
        "fulfillment_team": ("Fulfillment teams", FulfillmentTeam.objects.all()),
        "badge": ("Badges", Badge.objects.all()),
        "keyword": ("Keywords", Keyword.objects.all()),
        "attribute": ("Attributes", Attribute.objects.all()),
        "data_steward": ("Data stewards", DataSteward.objects.all()),
        "contact": ("Contacts", Contact.objects.all()),
        "product": ("Published products", Product.objects.published()),
    }


def source_catalog():
    """Labels for the form builder, without querying choice rows."""
    return [{"key": key, "label": label} for key, (label, _queryset) in _models().items()]


def choices_for(source):
    """Active marketplace rows as select options. Empty when the catalog cannot be read."""
    catalogs = _models()
    if source not in catalogs:
        return []
    try:
        rows = catalogs[source][1].filter(is_active=True).order_by("name")
        options = []
        seen = set()
        for row in rows:
            value = str(getattr(row, "value", None) or getattr(row, "name", None) or "").strip()
            label = str(getattr(row, "name", None) or value).strip()
            if not value or value in seen:
                continue
            seen.add(value)
            options.append({"value": value, "label": label or value})
        return options
    except (OperationalError, ProgrammingError):
        return []


def source_for(field):
    """A marketplace catalog is used only when the field asks for one."""
    current = str((field or {}).get("options_source") or "")
    if not current.startswith(PREFIX):
        return ""
    key = current[len(PREFIX):]
    return key if key in SOURCE_KEYS else ""


def apply_marketplace_choices(document):
    """Fill connected select fields from the live marketplace catalogs."""
    for section in document.get("sections") or []:
        for field in section.get("fields") or []:
            source = source_for(field)
            if not source:
                continue
            choices = choices_for(source)
            if not choices:
                continue
            field["options_source"] = PREFIX + source
            field["options"] = choices
            if str(field.get("type") or "text") == "text":
                field["type"] = "select"
    return document
