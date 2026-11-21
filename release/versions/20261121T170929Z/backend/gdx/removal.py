"""Instant removal, or a soft removal that is purged after 7 days."""

from datetime import timedelta

from django.utils import timezone
from django.utils.dateparse import parse_datetime

RETENTION_DAYS = 7


def purge_due():
    from apps.pages.models import Page
    from apps.third_party_apis.models import InstalledThirdPartyApi
    from gdx.platform_settings import load_settings, replace_pending_removals

    now = timezone.now()
    Page.objects.filter(is_deleted=True, purge_at__lte=now).delete()
    pending = load_settings().get("pending_removals") or []
    keep = []
    for item in pending:
        purge_at = parse_datetime(item.get("purge_at") or "")
        if purge_at is not None and timezone.is_naive(purge_at):
            purge_at = timezone.make_aware(purge_at, timezone.get_current_timezone())
        if item.get("kind") == "module" and purge_at is not None and purge_at <= now:
            InstalledThirdPartyApi.objects.filter(module_key=item.get("key")).delete()
            continue
        keep.append(item)
    if keep != pending:
        replace_pending_removals(keep)


def hidden_module_keys():
    from gdx.platform_settings import load_settings

    purge_due()
    return {
        item["key"]
        for item in load_settings().get("pending_removals") or []
        if item.get("kind") == "module"
    }


def remove_page(page, mode):
    if mode == "instant":
        page.delete()
        return "instant"
    page.soft_delete()
    return "soft"


def remove_module(module_key, mode):
    from apps.third_party_apis.models import InstalledThirdPartyApi
    from gdx.platform_settings import load_settings, replace_pending_removals

    row = InstalledThirdPartyApi.objects.filter(module_key=module_key).first()
    if row is None:
        return None
    if mode == "instant":
        row.delete()
        pending = [
            item for item in load_settings().get("pending_removals") or []
            if not (item.get("kind") == "module" and item.get("key") == module_key)
        ]
        replace_pending_removals(pending)
        return "instant"
    now = timezone.now()
    pending = [
        item for item in load_settings().get("pending_removals") or []
        if not (item.get("kind") == "module" and item.get("key") == module_key)
    ]
    pending.append({
        "kind": "module",
        "key": module_key,
        "deleted_at": now.isoformat(),
        "purge_at": (now + timedelta(days=RETENTION_DAYS)).isoformat(),
    })
    replace_pending_removals(pending)
    row.enabled = False
    row.save(update_fields=["enabled", "updated_at"])
    return "soft"


def allowed_mode(actions, requested):
    if requested == "instant" and "delete_now" in actions:
        return "instant"
    if requested == "soft" and "delete" in actions:
        return "soft"
    return None
