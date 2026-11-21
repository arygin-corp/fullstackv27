from django.urls import path

from gdx import deployment_views

app_name = "deployment"

urlpatterns = [
    path("", deployment_views.dashboard, name="dashboard"),
    path("analytics/", deployment_views.analytics, name="analytics"),
    path("activity/", deployment_views.activity, name="activity"),
    path("releases/", deployment_views.releases, name="releases"),
    path("rollback/", deployment_views.releases, name="rollback"),
    path("health/", deployment_views.health, name="health"),
    path("aws-session/", deployment_views.aws_session, name="aws_session"),
    path("ai-suggestion-engine/", deployment_views.ai_suggestion_engine, name="ai_suggestion_engine"),
    path("build/terminal/", deployment_views.build_terminal, name="build_terminal"),
    path("build/terminal/log/", deployment_views.build_terminal_log, name="build_terminal_log"),
    path("terminal/card/", deployment_views.terminal_card_log, name="terminal_card"),
    path("terminal/activity/", deployment_views.terminal_activity, name="terminal_activity"),
]
