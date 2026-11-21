from django.urls import path
from .views import search_page, suggest_products_by_role, suggest_products_enhanced, submit_feedback

urlpatterns = [
    path('search/', search_page, name='search_page'),
    path('suggest-products-by-role/', suggest_products_by_role, name='suggest_products_by_role'),
    path('suggest-products-enhanced/', suggest_products_enhanced, name='suggest_products_enhanced'),
    path("feedback/submit/", submit_feedback, name="submit_feedback"),
]