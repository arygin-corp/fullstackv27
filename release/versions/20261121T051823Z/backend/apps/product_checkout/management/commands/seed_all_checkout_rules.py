from django.core.management import call_command
from django.core.management.base import BaseCommand

from apps.marketplace.models import Product


class Command(BaseCommand):
    help = (
        "Seed Product Checkout configuration, questions, rules, "
        "validation, and routing for active Marketplace products."
    )

    def handle(self, *args, **options):
        products = Product.objects.filter(
            is_active=True
        ).order_by("id")

        total = products.count()

        self.stdout.write(
            self.style.NOTICE(
                f"Found {total} active products."
            )
        )

        seeded = 0
        failed = []

        for product in products:
            try:
                self.stdout.write(
                    f"Seeding Product "
                    f"[{product.id}] {getattr(product, 'name', '')}"
                )

                call_command(
                    "seed_checkout_rules",
                    str(product.id),
                )

                seeded += 1

            except Exception as exc:
                failed.append(product.id)

                self.stderr.write(
                    self.style.ERROR(
                        f"Failed Product "
                        f"[{product.id}]: {exc}"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {seeded} products."
            )
        )

        if failed:
            self.stdout.write(
                self.style.WARNING(
                    f"Failed products: {failed}"
                )
            )