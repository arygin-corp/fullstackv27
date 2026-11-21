# apps/profiles/urls.py
from django.urls import path
from . import views

app_name = 'profiles'

urlpatterns = [
    # path('user/', views.ms_user_lookup, name='ms_user_lookup'),
    # path('user/', views.tenant_user_lookup, name='tenant_user_lookup'),
    path('request-access/', views.request_access, name='request_access'),
    # path('search/gac/user', views.tenant_user_lookup, name='tenant_user_lookup'),
    path('edit/', views.edit_profile, name='edit_profile'),
    path('users/', views.user_list, name='user_list'), # IMPORTANT: Keep this before <str:username>/
    path('<str:username>/', views.profile_detail, name='profile_detail'),
]