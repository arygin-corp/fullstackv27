from django.urls import path

from gdx import theme_pages as views

app_name = "theme_pages"

urlpatterns = [
    path("dashboard/", views.dashboard_index, name="dashboard_index"),
    path("dashboard/index.html", views.dashboard_index, name="dashboard_index_html"),
    path("dashboard/<slug:slug>/", views.dashboard, name="dashboard"),
    path("dashboard/<slug:slug>/index.html", views.dashboard_index_html, name="dashboard_file"),
]
