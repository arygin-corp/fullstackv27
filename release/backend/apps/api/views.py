import os
from apps.marketplace.models import Product, Domain
from apps.marketplace.serializers import ProductSerializer, DomainSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import SystemInfo, ProjectResource
from .serializers import SystemInfoSerializer, ProjectResourceSerializer

class StatusView(APIView):
    def get(self, request):
        return Response({
            "status": "healthy",
            "environment": os.environ.get('ENVIRONMENT', 'unknown'),
            "schema": getattr(settings, 'DB_SCHEMA', 'public'),
            "db_host": settings.DATABASES['default'].get('HOST')
        })

class ResourceListView(APIView):
    def get(self, request):
        resources = ProjectResource.objects.all()
        serializer = ProjectResourceSerializer(resources, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class DomainListView(APIView):
    def get(self, request):
        products = Domain.objects.all()
        serializer = DomainSerializer(products, many=True)
        return Response(serializer.data)
