from django.urls import path

from gdx import site_api

app_name = "site_content"

urlpatterns = [
    path("", site_api.index, name="index"),
    path("leadership/", site_api.leadership, name="leadership"),
    path("roadmap/", site_api.roadmap, name="roadmap"),
    path("hackathon/", site_api.hackathon, name="hackathon"),
    path("campaign/", site_api.campaign, name="campaign"),
    path("newsroom/", site_api.newsroom, name="newsroom"),
    path("newsroom/<slug:slug>/", site_api.newsroom_post, name="newsroom-post"),
    path("resources/", site_api.resources, name="resources"),
    path("faqs/", site_api.faqs, name="faqs"),
    path("support/", site_api.support, name="support"),
    path("whats-new/", site_api.whats_new, name="whats-new"),
    path("support/<slug:source_id>/", site_api.support_article, name="support-article"),
]
