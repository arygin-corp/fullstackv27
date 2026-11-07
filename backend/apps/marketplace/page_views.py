from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views import View


class MarketplaceHomeView(LoginRequiredMixin, View):
    def get(self, request):
        return render(
            request,
            "gdx_users/apps/pages/pages/home.html",
            {
                "heading": "Dashboard",
                "heading2": "Home",
                "pageview": "Marketplace",
            },
        )
