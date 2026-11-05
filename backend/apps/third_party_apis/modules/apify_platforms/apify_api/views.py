from django.views.generic import TemplateView

class DashboardView(TemplateView):
    template_name = "apify_admin/dashboard/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["api_count"] = 0
        context["product_count"] = 0

        return context