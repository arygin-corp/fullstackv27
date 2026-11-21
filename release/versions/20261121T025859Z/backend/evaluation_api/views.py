from rest_framework import status
from rest_framework.permissions import (IsAdminUser, IsAuthenticated,)
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import EvaluationBuildSerializer


class EvaluationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services import get_status

        return Response(get_status())


class EvaluationCoverageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services import get_coverage

        try:
            limit = min(
                max(
                    int(request.query_params.get("limit", 500)),
                    1
                ),
                2000
            )
        except ValueError:
            limit = 500

        return Response(get_coverage(limit))


class EvaluationGroundTruthView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .services import get_ground_truth

        try:
            limit = min(
                max(
                    int(request.query_params.get("limit", 100)),
                    1
                ),
                1000
            )
        except ValueError:
            limit = 100

        return Response(get_ground_truth(limit))


class EvaluationBuildView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        from .services import build_evaluation

        serializer = EvaluationBuildSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            result = build_evaluation(
                serializer.validated_data
            )

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        except Exception as ex:

            return Response(
                {
                    "detail": str(ex)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )