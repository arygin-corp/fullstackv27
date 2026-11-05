from django.urls import path

from . import views

urlpatterns = [
    path("denodo/get-token", views.get_token, name="denodo-get-token"),
    path("denodo/table/view", views.table_view, name="denodo-table-view"),
]
