from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .key_services import generate_api_key
from .models import FrontendApplication, PublishedEndpoint
from .serializers import APIKeyMetadataSerializer, PublishedEndpointSerializer
class EndpointCatalogView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request): return Response(PublishedEndpointSerializer(PublishedEndpoint.objects.filter(enabled=True), many=True).data)
class APIKeyCreateView(APIView):
    permission_classes = (permissions.IsAdminUser,)
    def post(self, request, application_id):
        try: application = FrontendApplication.objects.get(pk=application_id, active=True)
        except FrontendApplication.DoesNotExist: return Response({"detail": "Application not found."}, status=404)
        try: generated = generate_api_key(application=application, name=request.data.get("name", "Default"), created_by=request.user, scopes=request.data.get("scopes", []), lifetime_days=int(request.data.get("lifetime_days", 90)), allowed_cidrs=request.data.get("allowed_cidrs", []))
        except (TypeError, ValueError) as exc: return Response({"detail": str(exc)}, status=400)
        data = APIKeyMetadataSerializer(generated.record).data; data["api_key"] = generated.plaintext; data["warning"] = "Store this value now. It will not be shown again."
        return Response(data, status=status.HTTP_201_CREATED)
