from django.urls import path

from .views import (
    EvaluationBuildView,
    EvaluationCoverageView,
    EvaluationGroundTruthView,
    EvaluationStatusView,
)

app_name = "evaluation_api"

urlpatterns = [
    path("status/", EvaluationStatusView.as_view(), name="status"),
    path("coverage/", EvaluationCoverageView.as_view(), name="coverage"),
    path("ground-truth/", EvaluationGroundTruthView.as_view(), name="ground-truth"),
    path("build/", EvaluationBuildView.as_view(), name="build"),
]