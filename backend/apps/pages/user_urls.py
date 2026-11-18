from django.urls import path

from . import site_crud, views

app_name = "pages_staff"

urlpatterns = [
    path("support/", views.support_hub, name="support-hub"),
    path("support/categories/", views.support_categories, name="support-categories"),
    path("support/articles/", views.support_articles, name="support-articles"),
    path("support/articles/<slug:source_id>/", views.support_article_page, name="support-article"),
    path("support/documents/", views.support_documents, name="support-documents"),
    path("support/documents/<int:pk>/", views.support_library_detail, {"kind": "document"}, name="support-document"),
    path("support/policies/<int:pk>/", views.support_library_detail, {"kind": "policy"}, name="support-policy"),
    path("support/processes/<int:pk>/", views.support_library_detail, {"kind": "process"}, name="support-process"),
    path("support/images/<int:pk>/", views.support_library_detail, {"kind": "image"}, name="support-image"),
    path("support/media/<int:pk>/", views.support_library_detail, {"kind": "media"}, name="support-media"),
    path("support/faqs/", views.support_faqs, name="support-faqs"),
    path("content/<slug:slug>/", views.frontend_page, name="frontend-page"),
    path("content/site/<slug:slug>/", views.site_page, name="site-page"),
    path("manage/<slug:key>/new/", site_crud.site_record_form, name="site-record-create"),
    path("manage/<slug:key>/<int:pk>/edit/", site_crud.site_record_form, name="site-record-edit"),
    path("manage/<slug:key>/<int:pk>/delete/", site_crud.site_record_delete, name="site-record-delete"),
    path("manage/<slug:key>/", site_crud.site_manage, name="site-manage"),
]
