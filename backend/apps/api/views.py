import os
from apps.marketplace.models import Product, Domain, SubDomain_1
from apps.marketplace.serializers import ProductSerializer, DomainSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.db.models import Count, Q
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
        if request.query_params.get("campaign") in ("1", "true", "yes"):
            return Response(self.campaign_domains())

        products = Domain.objects.all()
        serializer = DomainSerializer(products, many=True)
        return Response(serializer.data)

    def campaign_domains(self):
        approved = Q(product_domain__is_active=True, product_domain__status="approved")
        domains = (
            Domain.objects.filter(is_active=True)
            .annotate(product_count=Count("product_domain", filter=approved))
            .filter(product_count__gt=0)
            .order_by("-product_count", "name")
        )
        subdomain_rows = (
            SubDomain_1.objects.filter(is_active=True, domain__is_active=True)
            .annotate(
                product_count=Count(
                    "product_subdomain_2",
                    filter=Q(
                        product_subdomain_2__is_active=True,
                        product_subdomain_2__status="approved",
                    ),
                ),
                child_count=Count(
                    "subdomain_1",
                    filter=Q(subdomain_1__is_active=True),
                ),
            )
            .filter(product_count__gt=0)
            .order_by("domain_id", "-product_count", "name")
        )
        subdomains_by_domain = {}
        for subdomain in subdomain_rows:
            bucket = subdomains_by_domain.setdefault(subdomain.domain_id, [])
            if len(bucket) >= 3:
                continue
            bucket.append({
                "id": subdomain.id,
                "name": subdomain.name,
                "slug": subdomain.slug,
                "product_count": subdomain.product_count,
                "subdomains": [{"id": subdomain.id}] if subdomain.child_count else [],
            })

        payload = []
        for domain in domains:
            image = ""
            if domain.image:
                try:
                    image = domain.image.url
                except (ValueError, AttributeError):
                    image = ""
            payload.append({
                "id": domain.id,
                "name": domain.name,
                "slug": domain.slug,
                "image": image,
                "desc": domain.description or "",
                "product_count": domain.product_count,
                "subdomains": subdomains_by_domain.get(domain.id, []),
            })
        return payload
