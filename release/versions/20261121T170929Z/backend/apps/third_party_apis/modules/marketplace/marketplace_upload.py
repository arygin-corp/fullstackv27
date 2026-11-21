import os
import re
import time
from django.core.exceptions import ValidationError

def domain_upload_path(instance, filename):
    """
    Custom upload path for domain files
    Format: marketplace/domains/{domain_name}/{filename}
    """
    try:
        # Get domain name from the instance
        domain_name = getattr(instance, 'name', 'unknown_domain')

        # Clean the domain name
        if not domain_name:
            domain_name = 'unknown_domain'

        # Replace spaces and special characters
        clean_name = domain_name.strip().lower()
        clean_name = re.sub(r'[^a-zA-Z0-9.-]', '_', clean_name)
        clean_name = re.sub(r'_+', '_', clean_name)
        clean_name = clean_name.strip('_')[:50]

        return os.path.join('marketplace', 'domains', clean_name, filename)

    except Exception:
        return os.path.join('marketplace', 'domains', 'unknown', filename)

def subdomain_upload_path(instance, filename):
    """
    Custom upload path for subdomain files
    Format: marketplace/subdomains/{domain_subdomain_name}/{filename}
    Handles collision by prefixing with domain name
    """
    try:
        # Get subdomain and domain names
        subdomain_name = getattr(instance, 'name', 'unknown_subdomain')
        domain = getattr(instance, 'domain', None)

        if not subdomain_name:
            subdomain_name = 'unknown_subdomain'

        # Clean the subdomain name
        clean_subdomain = subdomain_name.strip().lower()
        clean_subdomain = re.sub(r'[^a-zA-Z0-9.-]', '_', clean_subdomain)
        clean_subdomain = re.sub(r'_+', '_', clean_subdomain)
        clean_subdomain = clean_subdomain.strip('_')[:30]

        # If domain exists, create combined name
        if domain:
            domain_name = getattr(domain, 'name', 'unknown')
            clean_domain = domain_name.strip().lower()
            clean_domain = re.sub(r'[^a-zA-Z0-9.-]', '_', clean_domain)
            clean_domain = re.sub(r'_+', '_', clean_domain)
            clean_domain = clean_domain.strip('_')[:30]

            # Combine domain and subdomain with underscore
            combined_name = f"{clean_domain}_{clean_subdomain}"
        else:
            combined_name = clean_subdomain

        return os.path.join('marketplace', 'subdomains', combined_name, filename)

    except Exception as e:
        return os.path.join('marketplace', 'subdomains', 'unknown', filename)


def contact_avatar_upload_path(instance, filename):
    """
    Enhanced upload path for contact avatars with comprehensive error handling
    Format: marketplace/{product_name}/{contact_name}/avatar/{filename}
    """
    try:
        # Get contact name with multiple fallback strategies
        contact_name = getattr(instance, 'name', None)
        if not contact_name:
            contact_name = getattr(instance, 'full_name', None)
        if not contact_name:
            contact_name = getattr(instance, 'email', None)
        if not contact_name:
            contact_name = f"contact_{getattr(instance, 'id', 'unknown')}"

        # Get product through various possible relationship names
        product = None
        product_attrs = ['product', 'product_id', 'parent_product', 'related_product']

        for attr in product_attrs:
            product = getattr(instance, attr, None)
            if product:
                break

        # If we found a product, get its name
        if product:
            product_name = getattr(product, 'name', None)
            if not product_name:
                product_name = getattr(product, 'title', None)
            if not product_name:
                product_name = f"product_{getattr(product, 'id', 'unknown')}"
        else:
            product_name = 'unknown_product'

        # Clean product name
        if not product_name:
            product_name = 'unknown_product'

        clean_product = product_name.strip().lower()

        # Remove protocol and common prefixes from product names that might be URLs
        clean_product = re.sub(r'^https?://', '', clean_product)
        clean_product = re.sub(r'^www\.', '', clean_product)

        # Replace invalid filesystem characters
        clean_product = re.sub(r'[^a-zA-Z0-9._-]', '_', clean_product)
        clean_product = re.sub(r'_+', '_', clean_product)
        clean_product = clean_product.strip('._-')

        if not clean_product:
            clean_product = 'unknown_product'

        # Limit product folder name length
        clean_product = clean_product[:40]

        # Clean contact name
        clean_contact = str(contact_name).strip().lower()
        clean_contact = re.sub(r'[^a-zA-Z0-9._-]', '_', clean_contact)
        clean_contact = re.sub(r'_+', '_', clean_contact)
        clean_contact = clean_contact.strip('._-')

        if not clean_contact:
            clean_contact = f"contact_{getattr(instance, 'id', 'unknown')}"

        # Limit contact folder name length
        clean_contact = clean_contact[:40]

        # Handle file extension and create unique filename
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = '.jpg'  # Default extension

        import uuid
        unique_id = str(uuid.uuid4())[:8]

        # Create descriptive filename
        timestamp = str(int(os.path.getmtime(__file__) if os.path.exists(__file__) else 0))[:6]
        new_filename = f"avatar_{clean_contact[:20]}_{unique_id}{ext}"

        return os.path.join('marketplace', clean_product, clean_contact, 'avatar', new_filename)

    except Exception as e:
        # Ultimate fallback with logging
        import uuid
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in contact_avatar_upload_path: {str(e)}")

        return os.path.join('marketplace', 'error', 'contact_avatar', f"fallback_{uuid.uuid4()}.jpg")

def product_image_upload_path(instance, filename):
    """
    Enhanced upload path for product images using BigInt-based unique identifier
    """
    try:
        # Get the product instance
        if hasattr(instance, 'product'):
            product = instance.product
        else:
            product = instance

        # Get product name or use fallback
        product_name = getattr(product, 'name', None)
        if not product_name:
            product_name = f"product_{getattr(product, 'id', 'unknown')}"

        # Clean the product name
        clean_name = product_name.strip().lower()
        clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', clean_name)
        clean_name = re.sub(r'_+', '_', clean_name)
        clean_name = clean_name.strip('_')

        if not clean_name:
            clean_name = 'unnamed_product'

        clean_name = clean_name[:50]

        # Get file extension
        ext = os.path.splitext(filename)[1].lower()

        # Use BigInt ID + timestamp for uniqueness
        product_id = getattr(product, 'id', None)
        unique_suffix = f"{product_id}_{int(time.time() * 1000)}" if product_id else str(int(time.time() * 1000))

        new_filename = f"{clean_name}_{unique_suffix}{ext}"

        return os.path.join('marketplace', 'products', clean_name, 'images', new_filename)

    except Exception as e:
        # Ultimate fallback
        fallback_suffix = str(int(time.time() * 1000))
        return os.path.join('marketplace', 'products', 'error', 'images', f"fallback_{fallback_suffix}.jpg")

def validate_image_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.svg', '.ico']
    if ext not in allowed_extensions:
        raise ValidationError(f'Unsupported file extension: {ext}. Allowed: {", ".join(allowed_extensions)}')