from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.external_apis.domain_services import tdsp_pods


class PodDropdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = tdsp_pods(request) or []
        options = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            value = str(row.get("u_primary") or row.get("value") or "").strip()
            if not value:
                continue
            options.append({
                "u_primary": value,
                "label": str(row.get("label") or value),
                "value": value,
            })
        return Response(options)
