from apps.notifications.models import Notification
from .search import search_notifications
from .timeline import notification_timeline
def source_object_timeline(*,user,object_type,object_id):
    qs=search_notifications(user=user,filters={"source_object_type":object_type}).filter(source_object_id=str(object_id))
    items=[]
    for n in qs:
        items.append({"when":n.created_at,"kind":"notification","title":n.title,"notification":n,"detail":{"type":n.notification_type,"source":n.source}})
        items.extend(notification_timeline(n))
    return sorted(items,key=lambda x:(x["when"],x["kind"]),reverse=True)
