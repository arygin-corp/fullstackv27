from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models, transaction
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.authentication import MarketplaceSignInAuthentication

from .access import can_manage_protected_membership, can_manage_workflow, can_view_audit, normalized_email
from .audit import snapshot, write_audit
from .models import IntakeSecurityEvent, ProductIntake, ProductIntakeAuditLog, UserNotification
from .serializers import AuditSerializer, IntakeApprovalEventSerializer, NotificationSerializer, ProductIntakeListSerializer, ProductIntakeReadSerializer, ProductIntakeWriteSerializer, ReasonSerializer, RejectSerializer, SecurityEventSerializer, AssignmentSerializer, MembershipSerializer
from .services import activate_marketplace_product, approve_intake, assign_intake, create_draft_product, curate_product, reject_intake, request_information, resubmit_intake, start_review, submit_intake


def signed_in_email(request):
    """Email from the marketplace sign-in token, or the Django account when one is used."""
    claims = request.auth if isinstance(request.auth, dict) else {}
    for key in ("preferred_username", "email", "upn"):
        value = claims.get(key)
        if isinstance(value, str) and "@" in value:
            return normalized_email(value)
    return normalized_email(getattr(request.user, "email", ""))


class ProductIntakeViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,mixins.RetrieveModelMixin,mixins.UpdateModelMixin,viewsets.GenericViewSet):
    authentication_classes = [SessionAuthentication, BasicAuthentication, MarketplaceSignInAuthentication]
    permission_classes=[IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "list":
            return ProductIntakeListSerializer
        return ProductIntakeWriteSerializer if self.action in {"create","update","partial_update"} else ProductIntakeReadSerializer

    def get_queryset(self):
        qs=ProductIntake.objects.select_related("marketplace_product","marketplace_domain","marketplace_datatype","marketplace_classification").prefetch_related("product_tags")
        listing = self.action == "list" or (self.request.method == "GET" and not self.kwargs.get("pk"))
        if listing:
            from apps.profiles.access import can_access_backend
            from apps.profiles.api import _django_user
            if not can_access_backend(_django_user(self.request)):
                raise PermissionDenied("Backend access is required.")
            return qs.exclude(status=ProductIntake.Status.DRAFT).order_by("-submitted_at", "-created_at", "-id")
        if can_manage_workflow(self.request.user): return qs
        email=signed_in_email(self.request)
        if not email:
            return qs.none()
        return qs.filter(models.Q(requester_email__iexact=email)|models.Q(submitted_by_email__iexact=email)).distinct()

    def perform_create(self, serializer):
        obj=serializer.save(); write_audit(intake=obj,action="created",actor=self.request.user,request=self.request,before={})

    def perform_update(self, serializer):
        before=snapshot(serializer.instance); obj=serializer.save(); write_audit(intake=obj,action="updated",actor=self.request.user,request=self.request,before=before)

    @action(detail=True,methods=["post"])
    def submit(self,request,pk=None):
        obj=submit_intake(intake_id=pk,actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"])
    def assign(self,request,pk=None):
        data=AssignmentSerializer(data=request.data); data.is_valid(raise_exception=True)
        user=get_user_model().objects.filter(pk=data.validated_data["user_id"],is_active=True).first()
        if not user: return Response({"user_id":"Active user not found."},status=400)
        obj=assign_intake(intake_id=pk,assignee=user,reason=data.validated_data["reason"],actor=request.user,request=request)
        return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"],url_path="request-information")
    def request_information(self,request,pk=None):
        data=ReasonSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=request_information(intake_id=pk,reason=data.validated_data["reason"],actor=request.user,request=request)
        return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"],url_path="start-review")
    def start_review(self,request,pk=None):
        obj=start_review(intake_id=pk,actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"])
    def approve(self,request,pk=None):
        data=ReasonSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=approve_intake(intake_id=pk,reason=data.validated_data["reason"],actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"],url_path="create-draft-product",url_name="create-draft-product")
    def create_draft(self,request,pk=None):
        data=ReasonSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=create_draft_product(intake_id=pk,reason=data.validated_data["reason"],actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"],url_path="curate-product",url_name="curate-product")
    def curate(self,request,pk=None):
        data=ReasonSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=curate_product(intake_id=pk,reason=data.validated_data["reason"],actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"])
    def reject(self,request,pk=None):
        data=RejectSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=reject_intake(intake_id=pk,reason=data.validated_data["reason"],comments=data.validated_data["comments"],actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"])
    def resubmit(self,request,pk=None):
        obj=resubmit_intake(intake_id=pk,actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["post"],url_path="activate-product")
    def activate_product(self,request,pk=None):
        data=ReasonSerializer(data=request.data); data.is_valid(raise_exception=True)
        obj=activate_marketplace_product(intake_id=pk,reason=data.validated_data["reason"],actor=request.user,request=request); return Response(ProductIntakeReadSerializer(obj).data)

    @action(detail=True,methods=["get"])
    def history(self,request,pk=None):
        return Response(IntakeApprovalEventSerializer(self.get_object().approval_events.all(),many=True).data)

    @action(detail=True,methods=["get"],url_path="audit-log")
    def audit_log(self,request,pk=None):
        if not can_view_audit(request.user):
            IntakeSecurityEvent.objects.create(event_type="audit_read_denied",outcome="denied",actor=request.user,actor_email=request.user.email,intake_id=pk,request_path=request.path,request_method=request.method,ip_address=request.META.get("REMOTE_ADDR"))
            return Response({"detail":"Super Administrator Group membership required."},status=403)
        obj=self.get_object()
        IntakeSecurityEvent.objects.create(event_type="audit_read",outcome="success",actor=request.user,actor_email=request.user.email,intake=obj,request_path=request.path,request_method=request.method,ip_address=request.META.get("REMOTE_ADDR"))
        response=Response(AuditSerializer(obj.audit_logs.all(),many=True).data); response["Cache-Control"]="private, no-store, no-cache, must-revalidate"; return response


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes=[IsAuthenticated]
    serializer_class=NotificationSerializer
    def get_queryset(self): return UserNotification.objects.filter(recipient_email__iexact=self.request.user.email)
    @action(detail=False,methods=["get"],url_path="unread-count")
    def unread_count(self,request): return Response({"count":self.get_queryset().filter(is_read=False).count()})
    @action(detail=True,methods=["post"])
    def read(self,request,pk=None):
        obj=self.get_object(); obj.is_read=True; obj.read_at=timezone.now(); obj.save(update_fields=["is_read","read_at"]); return Response(self.get_serializer(obj).data)
    @action(detail=False,methods=["post"],url_path="read-all")
    def read_all(self,request): self.get_queryset().filter(is_read=False).update(is_read=True,read_at=timezone.now()); return Response(status=status.HTTP_204_NO_CONTENT)


class SecurityEventViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes=[IsAuthenticated]
    serializer_class=SecurityEventSerializer
    queryset=IntakeSecurityEvent.objects.all()
    def list(self,request,*args,**kwargs):
        if not can_view_audit(request.user): return Response({"detail":"Super Administrator Group membership required."},status=403)
        return super().list(request,*args,**kwargs)


class ProtectedMembershipView(APIView):
    permission_classes=[IsAuthenticated]
    def _allowed(self,request):
        if can_manage_protected_membership(request.user): return True
        IntakeSecurityEvent.objects.create(event_type="membership_change_denied",outcome="denied",actor=request.user,actor_email=request.user.email,request_path=request.path,request_method=request.method,ip_address=request.META.get("REMOTE_ADDR"))
        return False
    def get(self,request):
        if not self._allowed(request): return Response({"detail":"Email allowlist authorization required."},status=403)
        return Response({g.name:list(g.user_set.filter(is_active=True).values("id","first_name","last_name","email")) for g in Group.objects.filter(name__in=["Content Manager Group","Adminsitrator Group","Super Administrator Group"])})
    @transaction.atomic
    def post(self,request):
        if not self._allowed(request): return Response({"detail":"Email allowlist authorization required."},status=403)
        data=MembershipSerializer(data=request.data); data.is_valid(raise_exception=True)
        users=get_user_model().objects.select_for_update().filter(email__iexact=data.validated_data["email"],is_active=True)
        if users.count()!=1: return Response({"email":"Exactly one active user must match."},status=400)
        user=users.get(); group=Group.objects.select_for_update().get(name=data.validated_data["group"]); group.user_set.add(user)
        IntakeSecurityEvent.objects.create(event_type="membership_added",outcome="success",actor=request.user,actor_email=request.user.email,target_email=user.email,details={"group":group.name})
        return Response({"detail":"Membership added."})
    @transaction.atomic
    def delete(self,request):
        if not self._allowed(request): return Response({"detail":"Email allowlist authorization required."},status=403)
        data=MembershipSerializer(data=request.data); data.is_valid(raise_exception=True)
        users=get_user_model().objects.select_for_update().filter(email__iexact=data.validated_data["email"])
        if users.count()!=1: return Response({"email":"Exactly one user must match."},status=400)
        user=users.get(); group=Group.objects.select_for_update().get(name=data.validated_data["group"])
        if group.name=="Super Administrator Group" and group.user_set.filter(is_active=True).count()<=1 and group.user_set.filter(pk=user.pk,is_active=True).exists():
            return Response({"detail":"The last active Super Administrator cannot be removed."},status=409)
        group.user_set.remove(user)
        IntakeSecurityEvent.objects.create(event_type="membership_removed",outcome="success",actor=request.user,actor_email=request.user.email,target_email=user.email,details={"group":group.name})
        return Response({"detail":"Membership removed."})
