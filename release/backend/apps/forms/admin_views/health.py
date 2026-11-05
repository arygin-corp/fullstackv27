from django.contrib.admin.views.decorators import staff_member_required
from django.db import connection
from django.db.models import Count
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from ..models import FormDefinition, FormField

def _breadcrumbs(*items):
	return [{'label': label, 'url': url} for label, url in items]

def system_health(request):
	checks = []
	try:
		with connection.cursor() as cursor:
			cursor.execute('SELECT 1')
			cursor.fetchone()
		checks.append({'name': 'Database', 'status': 'Healthy', 'level': 'success', 'message': 'Database connectivity check succeeded.'})
	except Exception:
		checks.append({'name': 'Database', 'status': 'Unavailable', 'level': 'danger', 'message': 'Database connectivity check failed.'})
	orphan_fields = FormField.objects.filter(section__isnull=True, is_active=True).count()
	unpublished_active = FormDefinition.objects.filter(is_active=True, is_published=False).count()
	forms_without_fields = FormDefinition.objects.annotate(total=Count('fields')).filter(total=0).count()
	checks.extend([{'name': 'Active draft forms', 'status': str(unpublished_active), 'level': 'warning' if unpublished_active else 'success', 'message': 'Active forms that are not published.'}, {'name': 'Forms without fields', 'status': str(forms_without_fields), 'level': 'warning' if forms_without_fields else 'success', 'message': 'Form definitions with no configured fields.'}, {'name': 'Unsectioned active fields', 'status': str(orphan_fields), 'level': 'info' if orphan_fields else 'success', 'message': 'Active fields that are not assigned to a section.'}])

	return render(
		request, 'gdx_admin/apps/dar/health/system_health.html', {'checks': checks, 'breadcrumbs': _breadcrumbs(('DAR', None), ('System Health', None))})


@method_decorator(staff_member_required, name="dispatch")
class SystemHealthDashboardView(TemplateView):
    template_name = "gdx_admin/apps/dar/health/system_health.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        checks = []

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

            checks.append({
                "name": "Database",
                "status": "Healthy",
                "level": "success",
                "message": "Database connectivity check succeeded.",
            })
        except Exception:
            checks.append({
                "name": "Database",
                "status": "Unavailable",
                "level": "danger",
                "message": "Database connectivity check failed.",
            })

        orphan_fields = FormField.objects.filter(
            section__isnull=True,
            is_active=True,
        ).count()

        unpublished_active = FormDefinition.objects.filter(
            is_active=True,
            is_published=False,
        ).count()

        forms_without_fields = (
            FormDefinition.objects
            .annotate(total=Count("fields"))
            .filter(total=0)
            .count()
        )

        checks.extend([
            {
                "name": "Active draft forms",
                "status": str(unpublished_active),
                "level": "warning" if unpublished_active else "success",
                "message": "Active forms that are not published.",
            },
            {
                "name": "Forms without fields",
                "status": str(forms_without_fields),
                "level": "warning" if forms_without_fields else "success",
                "message": "Form definitions with no configured fields.",
            },
            {
                "name": "Unsectioned active fields",
                "status": str(orphan_fields),
                "level": "info" if orphan_fields else "success",
                "message": "Active fields that are not assigned to a section.",
            },
        ])

        context["checks"] = checks
        context["breadcrumbs"] = _breadcrumbs(
            ("DAR", None),
            ("System Health", None),
        )

        return context