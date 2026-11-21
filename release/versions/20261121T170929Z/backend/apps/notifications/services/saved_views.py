from apps.notifications.models import SavedNotificationView
ALLOWED_FILTERS={"notification_type","application_id","source_object_type","lifecycle","pinned","action_required"}
def save_view(*,tenant,user,name,filters,is_default=False):
    clean={k:v for k,v in filters.items() if k in ALLOWED_FILTERS and v not in (None,"")}
    if is_default: SavedNotificationView.objects.filter(tenant=tenant,user=user,is_default=True).update(is_default=False)
    return SavedNotificationView.objects.update_or_create(tenant=tenant,user=user,name=name,defaults={"filters":clean,"is_default":is_default})[0]
