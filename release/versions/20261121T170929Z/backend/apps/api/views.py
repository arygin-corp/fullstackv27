import os
import re
from html import unescape

from apps.marketplace.models import Product, Domain, SubDomain_1, SubDomain_2
from apps.marketplace.serializers import ProductSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Q
from django.utils.html import strip_tags
from .models import SystemInfo, ProjectResource
from .serializers import SystemInfoSerializer, ProjectResourceSerializer

DOMAIN_CATALOG_CACHE_KEY = "marketplace-domain-catalog-v3"
DOMAIN_CATALOG_CACHE_SECONDS = 60

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

        payload = cache.get(DOMAIN_CATALOG_CACHE_KEY)
        if payload is None:
            payload = self.catalog_domains()
            cache.set(DOMAIN_CATALOG_CACHE_KEY, payload, DOMAIN_CATALOG_CACHE_SECONDS)
        return Response(payload)

    def catalog_domains(self):
        approved = Product.objects.filter(is_active=True, status="approved")
        domain_counts = self._counts(approved, "domain_id")
        sub1_counts = self._counts(approved, "subdomain_2_id")
        sub2_counts = self._counts(approved, "subdomain_3_id")
        singles = self._single_products(
            approved,
            domain_counts,
            sub1_counts,
            sub2_counts,
        )

        children_by_sub1 = {}
        for subdomain in SubDomain_2.objects.only(
            "id", "name", "slug", "image", "description", "subdomain_1_id"
        ):
            count = sub2_counts.get(subdomain.id, 0)
            if not count:
                continue
            children_by_sub1.setdefault(subdomain.subdomain_1_id, []).append(
                self._catalog_node(
                    subdomain,
                    subdomain.subdomain_1_id,
                    count,
                    singles.get(("subdomain2", subdomain.id)),
                    [],
                )
            )

        children_by_domain = {}
        for subdomain in SubDomain_1.objects.only(
            "id", "name", "slug", "image", "description", "domain_id"
        ):
            children = children_by_sub1.get(subdomain.id, [])
            count = sub1_counts.get(subdomain.id, 0)
            if not count and not children:
                continue
            children_by_domain.setdefault(subdomain.domain_id, []).append(
                self._catalog_node(
                    subdomain,
                    subdomain.domain_id,
                    count,
                    singles.get(("subdomain", subdomain.id)),
                    children,
                )
            )

        payload = []
        for domain in Domain.objects.only("id", "name", "slug", "image", "description"):
            children = children_by_domain.get(domain.id, [])
            count = domain_counts.get(domain.id, 0)
            if not count and not children:
                continue
            payload.append(
                self._catalog_node(
                    domain,
                    0,
                    count,
                    singles.get(("domain", domain.id)),
                    children,
                )
            )
        return payload

    def _counts(self, approved, field):
        counts = {}
        for row in approved.values(field).annotate(total=Count("id")):
            key = row[field]
            if key:
                counts[key] = row["total"]
        return counts

    def _single_products(self, approved, domain_counts, sub1_counts, sub2_counts):
        domain_ids = {key for key, total in domain_counts.items() if total == 1}
        sub1_ids = {key for key, total in sub1_counts.items() if total == 1}
        sub2_ids = {key for key, total in sub2_counts.items() if total == 1}
        query = Q()
        if domain_ids:
            query |= Q(domain_id__in=domain_ids)
        if sub1_ids:
            query |= Q(subdomain_2_id__in=sub1_ids)
        if sub2_ids:
            query |= Q(subdomain_3_id__in=sub2_ids)
        if not query:
            return {}

        singles = {}
        for row in approved.filter(query).values(
            "name", "slug", "domain_id", "subdomain_2_id", "subdomain_3_id"
        ):
            product = {"name": row["name"], "slug": row["slug"]}
            if row["domain_id"] in domain_ids:
                singles[("domain", row["domain_id"])] = product
            if row["subdomain_2_id"] in sub1_ids:
                singles[("subdomain", row["subdomain_2_id"])] = product
            if row["subdomain_3_id"] in sub2_ids:
                singles[("subdomain2", row["subdomain_3_id"])] = product
        return singles

    def _catalog_node(self, obj, parent_id, count, single_product, children):
        image = ""
        if getattr(obj, "image", None):
            try:
                image = obj.image.url
            except (ValueError, AttributeError):
                image = ""
        return {
            "id": obj.id,
            "categoryID": obj.id,
            "parentID": parent_id or 0,
            "name": obj.name,
            "slug": obj.slug,
            "image": image,
            "desc": self._plain_text(obj.description),
            "items": count,
            "product_count": count,
            "products": [single_product] if count == 1 and single_product else [],
            "subdomains": children,
        }

    def _plain_text(self, value):
        if not value:
            return ""
        text = re.sub(r"<\s*br\s*/?\s*>", " ", value, flags=re.I)
        text = re.sub(r"</\s*(p|div|li|h[1-6])\s*>", " ", text, flags=re.I)
        text = unescape(strip_tags(text))
        return re.sub(r"\s+", " ", text).replace("\xa0", " ").strip()

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
