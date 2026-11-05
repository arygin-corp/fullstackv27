from apps.notifications.models import DeliveryChannel, NotificationRule, RuleAction
ACTION_CHANNEL = {RuleAction.FORCE_IN_APP: DeliveryChannel.IN_APP, RuleAction.FORCE_EMAIL: DeliveryChannel.EMAIL, RuleAction.FORCE_TEAMS: DeliveryChannel.TEAMS, RuleAction.DIGEST_ONLY: DeliveryChannel.DIGEST}

def evaluate_rules(*, user, notification_type, source, title, default_channels):
    channels = set(default_channels); matched = []
    for rule in NotificationRule.objects.filter(user=user, is_active=True).order_by("priority", "id"):
        if not rule.matches(notification_type=notification_type, source=source, title=title): continue
        matched.append(rule.pk)
        if rule.action == RuleAction.SUPPRESS: channels.clear()
        elif rule.action == RuleAction.ALLOW: pass
        elif rule.action == RuleAction.DIGEST_ONLY: channels = {DeliveryChannel.DIGEST}
        else: channels.add(ACTION_CHANNEL[rule.action])
        if rule.stop_processing: break
    return channels, matched
