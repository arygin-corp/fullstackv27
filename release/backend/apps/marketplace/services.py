from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Product, ProductAssociation


@transaction.atomic
def create_product_association(*, product, associated_product, is_related=False, is_additional=False, reason="", position=None):
    locked_product = Product.objects.select_for_update().get(pk=product.pk)
    existing = ProductAssociation.objects.filter(product=locked_product)
    if existing.count() >= 15:
        raise ValidationError({"associated_product": "A product can have a maximum of 15 associated products."})
    if position is None:
        used = set(existing.values_list("position", flat=True))
        position = next((n for n in range(1, 16) if n not in used), None)
        if position is None:
            raise ValidationError({"position": "No available association position remains."})
    obj = ProductAssociation(product=locked_product, associated_product=associated_product,
                             is_related=is_related, is_additional=is_additional,
                             reason=reason, position=position)
    obj.full_clean()
    obj.save()
    return obj
