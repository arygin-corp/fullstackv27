from datetime import date, timedelta
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .lookup_serializers import CompanyHolidaySerializer, ProjectAreaCodeSerializer
from .models import CompanyHoliday, HolidayType, ProjectAreaCode

def _matches(holiday, check_date):
    return holiday.occurs_on(check_date)

class ProjectAreaCodeViewSet(viewsets.ModelViewSet):
    queryset = ProjectAreaCode.objects.all()
    serializer_class = ProjectAreaCodeSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method in permissions.SAFE_METHODS else [permissions.IsAdminUser()]

class CompanyHolidayViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyHolidaySerializer

    def get_queryset(self):
        queryset = CompanyHoliday.objects.all()
        return queryset if self.request.user.is_staff else queryset.filter(active=True)

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method in permissions.SAFE_METHODS else [permissions.IsAdminUser()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        raw = self.request.query_params.get('year')
        try:
            year = int(raw) if raw else timezone.localdate().year
        except (TypeError, ValueError):
            year = timezone.localdate().year
        context['year'] = min(max(year, 1), 9999)
        return context

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def business_day_status(request):
    raw = request.query_params.get('date')
    if not raw:
        return Response({'date': ['This query parameter is required.']}, status=400)
    try:
        check_date = date.fromisoformat(raw)
    except ValueError:
        return Response({'date': ['Use ISO format YYYY-MM-DD.']}, status=400)
    closures = list(CompanyHoliday.objects.filter(active=True))
    matched = [h for h in closures if _matches(h, check_date)]
    weekend = check_date.weekday() >= 5
    return Response({'date': check_date, 'is_business_day': not weekend and (not matched), 'is_weekend': weekend, 'holidays': CompanyHolidaySerializer(matched, many=True, context={'year': check_date.year}).data})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def next_business_day(request):
    raw = request.query_params.get('date')
    if not raw:
        return Response({'date': ['This query parameter is required.']}, status=400)
    try:
        current = date.fromisoformat(raw)
    except ValueError:
        return Response({'date': ['Use ISO format YYYY-MM-DD.']}, status=400)
    closures = list(CompanyHoliday.objects.filter(active=True))
    for _ in range(366 * 5):
        current += timedelta(days=1)
        if current.weekday() < 5 and (not any((_matches(h, current) for h in closures))):
            return Response({'input_date': raw, 'next_business_day': current})
    return Response({'detail': 'No business day found in search range.'}, status=422)
