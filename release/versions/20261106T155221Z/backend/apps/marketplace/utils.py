import json
import os
import tempfile
from django.conf import settings
from apps.marketplace.models import Product, Domain, SubDomain_1, SubDomain_2, ADGroup
from apps.orders.models import Request, Task

def atomic_json_dump(data, path, *, indent=4, default=None):
    """Write JSON completely, fsync it, then atomically replace the target."""
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=directory,
            prefix=f".{os.path.basename(path)}.", suffix=".tmp", delete=False,
        ) as temp_file:
            temp_path = temp_file.name
            json.dump(data, temp_file, indent=indent, default=default)
            temp_file.flush()
            os.fsync(temp_file.fileno())
        os.replace(temp_path, path)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


def get_base_url():
    return getattr(settings, 'BACKEND_URL', 'http://localhost:8000').rstrip('/')


def export_active_products_json():
    # Optimizing query with select_related/prefetch_related for performance
    queryset = Product.objects.published().select_related(
        'domain', 'subdomain_2', 'subdomain_3', 'datatype',
        'classification', 'org'
    ).prefetch_related('keyword', 'badge', 'images').order_by('id')

    data = []
    for p in queryset:
        # Helper for serialized contact info
        def serialize_contact(contact):
            if not contact: return None
            return {
                "name": getattr(contact, 'name', None),
                "email": getattr(contact, 'email', None),
                "phone": getattr(contact, 'phone', None)
            }

        # Full serialization logic matching your Product model
        item = {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "is_active": True,  # Hardcoded as per your requirement
            "status": p.status,

            # Domain Hierarchy
            "domain": p.domain.name if p.domain else None,
            "domain_slug": p.domain.slug if p.domain else None,
            "subdomain_2": p.subdomain_2.name if p.subdomain_2 else None,
            "subdomain_2_slug": p.subdomain_2.slug if p.subdomain_2 else None,
            "subdomain_3": p.subdomain_3.name if p.subdomain_3 else None,
            "subdomain_3_slug": p.subdomain_3.slug if p.subdomain_3 else None,

            # Descriptions & Meta
            "brief_desc": p.brief_desc,
            "short_desc": p.short_desc,
            "datatype": p.datatype.name if p.datatype else None,
            "classification": p.classification.name if p.classification else None,
            "catalog": p.catalog.name if p.catalog else None,
            "org": p.org.name if p.org else None,

            # Contacts
            "data_steward": p.data_steward.name if p.data_steward else None,
            "point_of_contact": serialize_contact(p.poc_name),
            "business_contact": serialize_contact(p.business_contact_name),

            # Many-to-Many Fields (Keywords & Badges)
            "keywords": [k.name for k in p.keyword.all()],
            "badges": [b.name for b in p.badge.all()],

            # Images
            "images": [img.image.url for img in p.images.all() if img.image],
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        data.append(item)

    # Save to Static JSON Path
    path = os.path.join(settings.BASE_DIR, 'assets/json/marketplace/products/products.json')
    atomic_json_dump(data, path, indent=4)


def export_active_ad_groups_json():
    """Generates ad_groups.json with active ad groups."""
    ad_values = list(ADGroup.objects.filter(is_active=True).values_list('value', flat=True).distinct())

    path = os.path.join(settings.BASE_DIR, 'assets/json/marketplace/ad_groups/ad_groups.json')
    atomic_json_dump(ad_values, path, indent=2)


def export_active_domains_json():
    # Determine the base URL for images
    base_url = getattr(settings, 'BACKEND_URL', getattr(settings, 'SITE_URL', 'http://localhost:8000')).rstrip('/')

    def get_full_image_url(obj):
        if hasattr(obj, 'image') and obj.image:
            return f"{base_url}{obj.image.url}"
        return None

    # Filter for active domains to keep the JSON clean
    domains = Domain.objects.filter(is_active=True).order_by('id')
    hierarchy_data = []

    for d in domains:
        d_count = Product.objects.published().filter(domain=d).count()

        domain_node = {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "slug": d.slug,
            "sku": d.sku,
            "image": get_full_image_url(d),
            "level": 0,
            "product_count": d_count,
            "subdomains": []
        }

        # Level 1 (SubDomain_1)
        sub1s = SubDomain_1.objects.filter(domain=d, is_active=True).order_by('id')
        for s1 in sub1s:
            s1_count = Product.objects.published().filter(subdomain_2=s1).count()

            s1_node = {
                "id": s1.id,
                "name": s1.name,
                "description": s1.description,
                "slug": s1.slug,
                "sku": s1.sku,
                "image": get_full_image_url(s1),
                "level": 1,
                "product_count": s1_count,
                "subdomains": []
            }

            # Level 2 (SubDomain_2)
            sub2s = SubDomain_2.objects.filter(subdomain_1=s1, is_active=True).order_by('id')
            for s2 in sub2s:
                s2_count = Product.objects.published().filter(subdomain_3=s2).count()

                s2_node = {
                    "id": s2.id,
                    "name": s2.name,
                    "description": s2.description,
                    "slug": s2.slug,
                    "sku": s2.sku,
                    "image": get_full_image_url(s2),
                    "level": 2,
                    "product_count": s2_count
                }
                s1_node["subdomains"].append(s2_node)

            domain_node["subdomains"].append(s1_node)

        hierarchy_data.append(domain_node)

    # Save to the static path
    path = os.path.join(settings.BASE_DIR, 'assets/json/marketplace/domains/domains.json')
    atomic_json_dump(hierarchy_data, path, indent=4)


def export_master_orders_json():
    """Generates orders.json by joining Request and Task tables."""
    # Fetch all requests and prefetch their related tasks for efficiency
    queryset = Request.objects.prefetch_related('task_set').all().order_by('-id')

    order_data = []

    for req in queryset:
        # Build the Request dictionary
        req_entry = {
            "id": req.id,
            "request_number": req.number,
            "request_id_alt": req.requestID,
            "opened_at": req.opened_at.isoformat() if req.opened_at else None,
            "closed_at": req.closed_at.isoformat() if req.closed_at else None,
            "opened_by": req.opened_by,
            "requested_for": req.requested_for,
            "submitted_by_name": req.submittedByName,
            "submitted_by_email": req.submittedByEmail,
            "ritm_state": req.ritm_state,
            "ritm_assigned_to": req.ritm_assigned_to,
            "stage": req.stage,
            "approval_stage": req.approval_stage,
            "product_id": req.product_id,
            "variables": req.variables,
            # Nested Tasks
            "tasks": [
                {
                    "task_id": t.id,
                    "task_number": t.number,
                    "ritm": t.ritm,
                    "state": t.state,
                    "assignment_group": t.assignment_group,
                    "assignment_group_manager": t.assignment_group_manager,
                    "created": t.created.isoformat() if t.created else None,
                    "due": t.due.isoformat() if t.due else None,
                } for t in req.task_set.all()
            ]
        }
        order_data.append(req_entry)

    # File path setup
    file_path = os.path.join(settings.BASE_DIR, 'assets/json/marketplace/orders/orders.json')
    atomic_json_dump(order_data, file_path, indent=4, default=str)

    return file_path