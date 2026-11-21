from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views
router=DefaultRouter()
for prefix,view,base in [
 ('cms/homepages',views.HomepageViewSet,'homepage'),('cms/brands',views.BrandViewSet,'brand'),('cms/documents',views.DocumentViewSet,'document'),('cms/policies',views.PolicieViewSet,'policie'),('cms/processes',views.ProcesseViewSet,'processe'),('cms/media',views.MediaViewSet,'media'),
 ('public/homepages',views.PublicHomepageViewSet,'public-homepage'),('public/brands',views.PublicBrandViewSet,'public-brand'),('public/documents',views.PublicDocumentViewSet,'public-document'),('public/policies',views.PublicPolicieViewSet,'public-policie'),('public/processes',views.PublicProcesseViewSet,'public-processe'),('public/media',views.PublicMediaViewSet,'public-media'),
 ('change-requests',views.ResourceChangeRequestViewSet,'change-request'),('versions',views.ResourceVersionViewSet,'version'),('audit',views.ResourceApprovalAuditViewSet,'audit'),('analytics',views.ResourceAnalyticsViewSet,'analytics')]: router.register(prefix,view,basename=base)
urlpatterns=[path('',include(router.urls))]
