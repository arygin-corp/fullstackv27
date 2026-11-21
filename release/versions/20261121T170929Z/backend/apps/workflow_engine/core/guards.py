def context_flag_guard(*, instance, actor, payload):
    """Example guard used as workflow_engine.guards.context_flag_guard."""
    return bool(instance.context.get("approved") or payload.get("approved"))
