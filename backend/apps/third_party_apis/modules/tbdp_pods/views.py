from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import PodsError, pod_options


class PodDropdownView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            return Response(pod_options())
        except PodsError as error:
            return Response({"error": error.message}, status=error.status_code)
