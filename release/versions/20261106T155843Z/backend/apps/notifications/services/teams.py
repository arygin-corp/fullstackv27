import json
from urllib.request import Request, urlopen

def teams_payload(notification):
    facts = [{"title": "Type", "value": notification.get_notification_type_display()}, {"title": "Source", "value": notification.source}]
    action = [{"@type": "OpenUri", "name": "Open notification", "targets": [{"os": "default", "uri": notification.url}]}] if notification.url else []
    return {"@type": "MessageCard", "@context": "http://schema.org/extensions", "summary": notification.title, "themeColor": "0078D4", "title": notification.title, "text": notification.body or notification.title, "sections": [{"facts": facts}], "potentialAction": action}

def send_to_teams(webhook_url, notification, timeout=5):
    request=Request(webhook_url,data=json.dumps(teams_payload(notification)).encode(),headers={"Content-Type":"application/json"},method="POST")
    with urlopen(request, timeout=timeout) as response:
        if response.status not in (200,202): raise ConnectionError(f"Teams webhook returned {response.status}")
        return True
