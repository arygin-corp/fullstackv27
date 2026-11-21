def adaptive_card(notification,actions=None):
    actions=actions or []
    card={"type":"AdaptiveCard","version":"1.5","$schema":"http://adaptivecards.io/schemas/adaptive-card.json","body":[{"type":"TextBlock","text":notification.title,"weight":"Bolder","size":"Medium","wrap":True},{"type":"TextBlock","text":notification.body or notification.title,"wrap":True},{"type":"FactSet","facts":[{"title":"Type","value":notification.get_notification_type_display()},{"title":"Source","value":notification.source}]}],"actions":[]}
    if notification.url: card["actions"].append({"type":"Action.OpenUrl","title":"Open notification","url":notification.url})
    for a in actions: card["actions"].append({"type":"Action.OpenUrl","title":a["title"],"url":a["url"]})
    return {"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":card}]}
