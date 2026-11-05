from django.urls import path

from .views import TenantUserListView, TenantUserLookupView, TenantUserManagerView, TenantUserPhotoView

app_name = "people"

urlpatterns = [
    path("search/gac/user/", TenantUserLookupView.as_view(), name="tenant_user_lookup",),
    path("users/", TenantUserListView.as_view(), name="tenant_user_list"),
    path("users/<str:user_id>/manager/", TenantUserManagerView.as_view(),name="tenant_user_manager",),
    path("users/<str:user_id>/photo/", TenantUserPhotoView.as_view(), name="tenant_user_photo",),
]
