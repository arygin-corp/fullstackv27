from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help="Create/update Administrator Group with changelog CRUD and audit-read permissions."
    def handle(self, *args, **options):
        group,_=Group.objects.get_or_create(name="Administrator Group")
        codes=["view_categorie","add_categorie","change_categorie","delete_categorie","view_post","add_post","change_post","delete_post","view_auditlog","view_all_audit_logs","approve_post","publish_post","view_notification","change_notification","view_releasesubscription","change_releasesubscription"]
        perms=Permission.objects.filter(content_type__app_label="changelog", codename__in=codes)
        group.permissions.add(*perms)
        self.stdout.write(self.style.SUCCESS(f"Administrator Group now has {perms.count()} changelog permissions."))

        requested = set(codes)

        found = set(
            perms.values_list(
                "codename",
                flat=True,
            )
        )

        missing = requested - found

        if missing:
            raise Exception(
                "Missing permissions: "
                + ", ".join(
                    sorted(missing)
                )
            )