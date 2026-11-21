from django.contrib.contenttypes.models import ContentType
from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Brand, Document, Homepage, Media, Policie, Processe, ResourceAnalytics, ResourceApprovalAudit, ResourceChangeRequest, ResourceVersion
from .permissions import IsAuthenticatedReadAdminWrite
from .serializers import BrandSerializer, DocumentSerializer, HomepageSerializer, MediaSerializer, PolicieSerializer, ProcesseSerializer, ResourceAnalyticsSerializer, ResourceApprovalAuditSerializer, ResourceChangeRequestSerializer, ResourceVersionSerializer
from .services.core import approve_change, apply_change, archive_resource, increment_analytics, reject_change, restore_resource, restore_version, submit_change

class BaseResourceViewSet(viewsets.ModelViewSet):
    permission_classes=(IsAuthenticatedReadAdminWrite,)
    def get_queryset(self):
        qs=super().get_queryset()
        archived=self.request.query_params.get('archived')
        return qs.filter(is_archived=True) if archived and archived.lower()=='true' else qs.filter(is_archived=False)
    def perform_create(self,serializer): serializer.save(created_by=self.request.user,updated_by=self.request.user)
    def perform_update(self,serializer): serializer.save(updated_by=self.request.user)
    def destroy(self,request,*args,**kwargs): raise MethodNotAllowed('DELETE','Hard delete is prohibited. Use archive.')
    @action(detail=True,methods=['post'])
    def archive(self,request,pk=None): archive_resource(self.get_object(),request.user); return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=True,methods=['post'])
    def restore(self,request,pk=None):
        obj=self.get_queryset().model.objects.get(pk=pk); restore_resource(obj,request.user); return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=['post'],url_path='track/(?P<metric>visits|views|downloads|opens)')
    def track(self,request,pk=None,metric=None): increment_analytics(self.get_object(),metric); return Response(status=status.HTTP_204_NO_CONTENT)

class HomepageViewSet(BaseResourceViewSet): queryset=Homepage.objects.all(); serializer_class=HomepageSerializer
class BrandViewSet(BaseResourceViewSet): queryset=Brand.objects.all(); serializer_class=BrandSerializer
class DocumentViewSet(BaseResourceViewSet): queryset=Document.objects.all(); serializer_class=DocumentSerializer
class PolicieViewSet(BaseResourceViewSet): queryset=Policie.objects.all(); serializer_class=PolicieSerializer
class ProcesseViewSet(BaseResourceViewSet): queryset=Processe.objects.all(); serializer_class=ProcesseSerializer
class MediaViewSet(BaseResourceViewSet): queryset=Media.objects.all(); serializer_class=MediaSerializer

class PublicResourceMixin:
    permission_classes=(IsAuthenticated,); http_method_names=('get','head','options')
    def get_queryset(self): return super().get_queryset().filter(is_active=True,is_archived=False)
class PublicHomepageViewSet(PublicResourceMixin,HomepageViewSet): pass
class PublicBrandViewSet(PublicResourceMixin,BrandViewSet): pass
class PublicDocumentViewSet(PublicResourceMixin,DocumentViewSet): pass
class PublicPolicieViewSet(PublicResourceMixin,PolicieViewSet): pass
class PublicProcesseViewSet(PublicResourceMixin,ProcesseViewSet): pass
class PublicMediaViewSet(PublicResourceMixin,MediaViewSet): pass

class ResourceChangeRequestViewSet(viewsets.ModelViewSet):
    queryset=ResourceChangeRequest.objects.select_related('submitter','approver','resource_type').prefetch_related('attachments')
    serializer_class=ResourceChangeRequestSerializer; permission_classes=(IsAuthenticated,); http_method_names=('get','post','patch','head','options')
    def perform_create(self,serializer): serializer.save(submitter=self.request.user)
    @action(detail=True,methods=['post'])
    def submit(self,request,pk=None): return Response(self.get_serializer(submit_change(self.get_object())).data)
    @action(detail=True,methods=['post'])
    def approve(self,request,pk=None): return Response(self.get_serializer(approve_change(self.get_object(),request.user,request.data.get('comment',''))).data)
    @action(detail=True,methods=['post'])
    def reject(self,request,pk=None): return Response(self.get_serializer(reject_change(self.get_object(),request.user,request.data.get('comment',''))).data)
    @action(detail=True,methods=['post'])
    def apply(self,request,pk=None): apply_change(self.get_object(),request.user); return Response(self.get_serializer(self.get_object()).data)
class ResourceVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=ResourceVersion.objects.all(); serializer_class=ResourceVersionSerializer; permission_classes=(IsAuthenticated,)
    @action(detail=True,methods=['post'])
    def restore(self,request,pk=None): restore_version(self.get_object(),request.user); return Response(status=status.HTTP_204_NO_CONTENT)
class ResourceApprovalAuditViewSet(viewsets.ReadOnlyModelViewSet): queryset=ResourceApprovalAudit.objects.all(); serializer_class=ResourceApprovalAuditSerializer; permission_classes=(IsAuthenticated,)
class ResourceAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=ResourceAnalytics.objects.all(); serializer_class=ResourceAnalyticsSerializer; permission_classes=(IsAuthenticated,)
    @action(detail=False,methods=['get'])
    def dashboard(self,request):
        metric=request.query_params.get('metric','views')
        if metric not in {'views','downloads','opens'}: metric='views'
        return Response(self.get_serializer(self.get_queryset().order_by(F(metric).desc())[:10],many=True).data)
