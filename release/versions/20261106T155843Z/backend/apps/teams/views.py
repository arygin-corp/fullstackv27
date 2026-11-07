from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from .models import Team
from .forms import TeamForm

class TeamListView(ListView):
    model = Team
    template_name = 'teams/list.html' # Updated template path
    context_object_name = 'teams'

class TeamDetailView(DetailView):
    model = Team
    template_name = 'teams/detail.html' # Updated template path
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

class TeamCreateView(LoginRequiredMixin, CreateView):
    model = Team
    form_class = TeamForm
    template_name = 'teams/form.html' # Updated template path
    success_url = reverse_lazy('teams:list')

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
    template_name = 'teams/form.html' # Updated template path
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def test_func(self):
        team = self.get_object()
        return self.request.user == team.owner

class TeamDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Team
    template_name = 'teams/delete.html'
    success_url = reverse_lazy('marketplace:index')

    def test_func(self):
        team = self.get_object()
        return self.request.user.is_superuser or self.request.user == team.owner
