from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse, reverse_lazy
from .models import Team
from .forms import TeamForm

IMAGE_FIELDS = ("icon", "logo", "cover_image")

class TeamListView(ListView):
    model = Team
    template_name = "gdx_admin/apps/teams/teams.html"
    context_object_name = "teams"

    def get_queryset(self):
        qs = (
            Team.objects.select_related("tenant", "owner", "owner__profile")
            .annotate(member_count=Count("members"))
        )
        q = self.request.GET.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(slug__icontains=q)
                | Q(owner__first_name__icontains=q)
                | Q(owner__username__icontains=q)
            )
        return qs

class TeamDetailView(DetailView):
    model = Team
    template_name = "gdx_admin/apps/teams/detail.html"
    context_object_name = "team"

class TeamCreateView(LoginRequiredMixin, CreateView):
    model = Team
    form_class = TeamForm
    template_name = "gdx_admin/apps/teams/form.html"
    success_url = reverse_lazy("teams:list")

    def form_valid(self, form):
        obj = form.save(commit=False)
        if not obj.owner:
            obj.owner = self.request.user
        obj.save()
        form.save_m2m()
        return super().form_valid(form)

class TeamUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Team
    form_class = TeamForm
    template_name = "gdx_admin/apps/teams/form.html"

    def get_success_url(self):
        return reverse("teams:detail", kwargs={"pk": self.object.pk})

    def test_func(self):
        team = self.get_object()
        return self.request.user == team.owner

class TeamImageUploadView(LoginRequiredMixin, UserPassesTestMixin, View):
    def test_func(self):
        self.team = get_object_or_404(Team, pk=self.kwargs["pk"])
        return self.request.user.is_superuser or self.request.user == self.team.owner

    def post(self, request, pk):
        field = request.POST.get("field")
        if field not in IMAGE_FIELDS:
            return redirect("teams:detail", pk=self.team.pk)
        upload = request.FILES.get(field)
        if upload:
            try:
                cleaned = TeamForm(instance=self.team).fields[field].clean(upload)
            except ValidationError as exc:
                messages.error(request, exc.messages[0])
                return redirect("teams:detail", pk=self.team.pk)
            setattr(self.team, field, cleaned)
            self.team.save(update_fields=[field])
        return redirect("teams:detail", pk=self.team.pk)

class TeamDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Team
    template_name = "gdx_admin/apps/teams/delete.html"
    success_url = reverse_lazy("teams:list")

    def test_func(self):
        team = self.get_object()
        return self.request.user.is_superuser or self.request.user == team.owner
