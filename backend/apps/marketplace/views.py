# apps/marketplace/views.py
from django.db import transaction
from django.db.models import Q
from django.contrib import messages
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy, reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from apps.teams.models import Team
from .models import Product, Domain, Datatype, Classification, FieldName, FieldValue, ProductAssociation
from .forms import ProductForm, ProductImageFormSet
from django.db.models import Prefetch

class ProductDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Product
    template_name = 'marketplace/products/delete.html'
    success_url = reverse_lazy('marketplace:index')

    def test_func(self):
        product = self.get_object()
        # Using created_by as the Product model does not have an 'owner' field
        return self.request.user.is_superuser or self.request.user == product.created_by

class IndexView(ListView):
    model = Product
    template_name = 'marketplace/products/index.html'
    context_object_name = 'products'
    paginate_by = 10

    def get_queryset(self):
        queryset = Product.objects.select_related('domain', 'datatype', 'classification').prefetch_related('images').order_by('id')

        search_query = self.request.GET.get('q', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(brief_desc__icontains=search_query) |
                Q(short_desc__icontains=search_query) |
                Q(domain__name__icontains=search_query) |
                Q(datatype__name__icontains=search_query) |
                Q(classification__name__icontains=search_query)
            )

        status_filter = self.request.GET.get('status', None)
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        type_filter = self.request.GET.get('type', None)
        if type_filter and type_filter != 'all':
            queryset = queryset.filter(datatype__name=type_filter)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = ""
        context['heading'] = "Product List"
        context['heading2'] = "All Products"
        context['pageview'] = "Products"

        context['domains'] = [{'id': domain.id, 'name': domain.name} for domain in
                              Domain.objects.all().order_by('name')]
        context['datatypes'] = [{'id': datatype.id, 'name': datatype.name} for datatype in
                                Datatype.objects.all().order_by('name')]

        context['current_per_page'] = int(self.request.GET.get('per_page', self.paginate_by))

        user = self.request.user
        is_auth = getattr(user, "is_authenticated", False)

        if is_auth:
            context["is_content_manager"] = user.groups.filter(
                name__in=["Content Manager Group", "Web Publishers Group"]
            ).exists()
            context["is_super_admin"] = user.groups.filter(
                name="SuperAdmin Group"
            ).exists()
        else:
            context["is_content_manager"] = False
            context["is_super_admin"] = False

        paginator = Paginator(self.get_queryset(), self.paginate_by)
        page_number = self.request.GET.get('page', 1)
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
        context['page_obj'] = page_obj
        context['products'] = page_obj.object_list
        context['total_products_count'] = Product.objects.count()

        return context

    def get(self, request, *args, **kwargs):
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('draw')

        if is_ajax:
            try:
                draw = int(request.GET.get('draw', 1))
                start = int(request.GET.get('start', 0))
                length = int(request.GET.get('length', self.paginate_by))

                queryset = self.get_queryset()
                total_records = Product.objects.count()
                filtered_records = queryset.count()
                products_page = queryset[start:start + length]

                data = []
                user = request.user
                is_auth = getattr(user, "is_authenticated", False)
                is_content_manager = False
                is_super_admin = False

                if is_auth:
                    is_content_manager = user.groups.filter(
                        name__in=["Content Manager Group", "Web Publishers Group"]
                    ).exists()
                    is_super_admin = user.groups.filter(
                        name="SuperAdmin Group"
                    ).exists()

                for product in products_page:
                    # Safely get the image URL
                    first_image = product.images.first()
                    product_image_url = first_image.image.url if first_image and first_image.image else '/static/images/default-product.png'

                    actions_html = f'<div class="d-flex gap-2 justify-content-center align-items-center">'
                    if is_content_manager or is_super_admin:
                        actions_html += f'''
                            <a href="{reverse_lazy("marketplace:edit", kwargs={"pk": product.pk})}">
                                <i class="bx bxs-edit-alt align-bottom text-primary" style="font-size: 20px; line-height: 2;"></i>
                            </a>'''
                    if is_super_admin:
                        actions_html += f'''
                            <a href="{reverse_lazy("marketplace:delete", kwargs={"pk": product.pk})}">
                               <i class="bx bx-trash align-bottom text-danger" style="font-size: 20px;"></i>
                            </a>'''
                    actions_html += '</div>'

                    status_badge_class = ""
                    if product.status == 'draft':
                        status_badge_class = "badge-soft-primary me-2 badge badge-soft-primary-custom"
                    elif product.status == 'approved':
                        status_badge_class = "badge-soft-success me-1 badge badge-soft-success-custom"
                    elif product.status == 'pending':
                        status_badge_class = "badge-soft-info me-1 badge badge-soft-info-custom"
                    elif product.status == 'archived':
                        status_badge_class = "badge-soft-dark me-1 badge badge-soft-dark-custom"
                    elif product.status == 'discontinued':
                        status_badge_class = "badge-soft-danger me-1 badge badge-soft-danger-custom"
                    else:
                        status_badge_class = "badge bg-secondary text-white"

                    data.append({
                        'id': product.id,
                        'products': f'''
                            <img src="{product_image_url}" alt="{product.name}" style="max-width: 50px; max-height: 50px; margin-right: 10px; display: inline-block; vertical-align: middle;">
                            <a href="{reverse_lazy("marketplace:detail", kwargs={"pk": product.pk})}" class="text-truncate font-size-14 text-dark">{product.name}</a>''',
                        'domains': product.domain.name if product.domain else '',
                        'datatypes': product.datatype.name if product.datatype else '',
                        'classifications': product.classification.name if product.classification else '',
                        'status': f'<span class="{status_badge_class}" style="font-size: 12px !important; padding: 4px 12px !important;">{product.get_status_display()}</span>',
                        'actions': actions_html
                    })

                return JsonResponse({
                    'draw': draw,
                    'recordsTotal': total_records,
                    'recordsFiltered': filtered_records,
                    'data': data,
                })
            except Exception as e:
                return JsonResponse({
                    'draw': int(request.GET.get('draw', 1)),
                    'recordsTotal': 0,
                    'recordsFiltered': 0,
                    'data': [],
                    'error': str(e)
                }, status=500)
        else:
            return super().get(request, *args, **kwargs)


class ProductCreateView(LoginRequiredMixin, CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'marketplace/products/create.html'
    success_url = reverse_lazy('marketplace:index')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = ""
        context['heading'] = "Create Product"
        context['heading2'] = "Create"
        context['pageview'] = "Products"
        if self.request.POST:
            context['image_formset'] = ProductImageFormSet(self.request.POST, self.request.FILES)
        else:
            context['image_formset'] = ProductImageFormSet()
        return context

    def form_valid(self, form):
        context = self.get_context_data(form=form)
        image_formset = context['image_formset']
        if not image_formset.is_valid():
            return self.render_to_response(context)

        with transaction.atomic():
            self.object = form.save(commit=False)
            self.object.created_by = self.request.user
            self.object.updated_by = self.request.user
            self.object.save()
            form.save_m2m()
            form.save_sample_data(self.object)
            image_formset.instance = self.object
            image_formset.save()

        return redirect(self.get_success_url())


class ProductDetailView(DetailView):
    model = Product
    template_name = 'marketplace/products/detail.html'
    context_object_name = 'product'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = ""
        context['heading'] = "Product Details"
        context['heading2'] = "Details"
        context['pageview'] = "Products"
        user = self.request.user
        is_auth = getattr(user, "is_authenticated", False)

        if is_auth:
            context["is_content_manager"] = user.groups.filter(
                name__in=["Content Manager Group", "Web Publishers Group"]
            ).exists()
            context["is_super_admin"] = user.groups.filter(
                name="SuperAdmin Group"
            ).exists()
        else:
            context["is_content_manager"] = False
            context["is_super_admin"] = False

        return context


class PendingListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Product
    template_name = 'marketplace/products/pending.html'
    context_object_name = 'pending_products'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = ""
        context['heading'] = "Pending Products"
        context['heading2'] = "Pending"
        context['pageview'] = "Products"
        return context

    def test_func(self):
        return self.request.user.is_superuser or self.request.user.is_staff

    def get_queryset(self):
        return super().get_queryset().filter(status='pending').order_by('-created_at')


@login_required
@require_POST
def approve_product(request, pk):
    if not request.user.has_perm('marketplace.change_product'):
        return redirect(reverse_lazy('marketplace:index'))

    product = get_object_or_404(Product, pk=pk)
    product.status = 'approved'
    product.approved_by = request.user
    product.approved_at = timezone.now()
    product.save()
    return redirect('marketplace:pending')


class ProductUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'marketplace/products/edit.html'
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs

    def test_func(self):
        product = self.get_object()
        return self.request.user.is_superuser or self.request.user == product.created_by

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = ""
        context['heading'] = "Edit Product"
        context['heading2'] = "Edit"
        context['pageview'] = "Products"
        if self.request.POST:
            context['image_formset'] = ProductImageFormSet(self.request.POST, self.request.FILES, instance=self.object)
        else:
            context['image_formset'] = ProductImageFormSet(instance=self.object)

        try:
            data_review_board_team = Team.objects.get(name="Data Review Board Team")
            context['data_review_board_team_id'] = data_review_board_team.pk
        except Team.DoesNotExist:
            context['data_review_board_team_id'] = 13

        if self.object.classification:
            current_class = self.object.classification.name
            context['disable_ckeditor'] = current_class in ['Public', 'Protected']
        else:
            context['disable_ckeditor'] = False

        return context

    def form_valid(self, form):
        context = self.get_context_data(form=form)
        image_formset = context['image_formset']
        if not image_formset.is_valid():
            messages.error(self.request, "Validation failed. Please check the form and images.")
            return self.render_to_response(context)

        with transaction.atomic():
            self.object = form.save(commit=False)
            self.object.updated_by = self.request.user
            self.object.save()
            form.save_m2m()
            form.save_sample_data(self.object)
            image_formset.instance = self.object
            image_formset.save()

        messages.success(self.request, f"Product '{self.object.name}' updated successfully.")
        return redirect(reverse('marketplace:index'))

    def get_success_url(self):
        return reverse('marketplace:index')


def get_field_names(request):
    try:
        field_names = FieldName.objects.filter(is_active=True).order_by('name')
        data = [{
            'id': fn.id,
            'name': fn.name,
            'collibra_id': fn.collibra_id or '',
            'axon_id': fn.axon_id or ''
        } for fn in field_names]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_field_name_detail(request, field_name_id):
    try:
        field_name = get_object_or_404(FieldName, pk=field_name_id, is_active=True)
        data = {
            'id': field_name.id,
            'name': field_name.name,
            'collibra_id': field_name.collibra_id or '',
            'axon_id': field_name.axon_id or ''
        }
        return JsonResponse(data)
    except FieldName.DoesNotExist:
        return JsonResponse({'error': 'Field name not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_field_values(request):
    try:
        field_name_id = request.GET.get('field_name')
        field_values = FieldValue.objects.filter(is_active=True)
        if field_name_id:
            field_values = field_values.filter(field_name_id=field_name_id)
        field_values = field_values.order_by('value')
        data = [{'id': fv.id, 'value': fv.value} for fv in field_values]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_field_value_detail(request, field_value_id):
    try:
        field_value = get_object_or_404(FieldValue, pk=field_value_id, is_active=True)
        data = {
            'id': field_value.id,
            'value': field_value.value,
        }
        return JsonResponse(data)
    except FieldValue.DoesNotExist:
        return JsonResponse({'error': 'Field value not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


class ProductListAPIView:
    @classmethod
    def as_view(cls):
        pass


class ProductDetailAPIView:
    @classmethod
    def as_view(cls):
        pass

PRODUCT_ASSOCIATION_PREFETCH = Prefetch(
    "product_associations",
    queryset=ProductAssociation.objects.filter(
        associated_product__is_active=True,
        associated_product__status="approved",
    ).select_related("associated_product", "associated_product__datatype").prefetch_related("associated_product__images").order_by("position"),
)

from rest_framework import permissions, viewsets

from .models import EndToEndSolution
from .serializers import EndToEndSolutionSerializer


class EndToEndSolutionViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = EndToEndSolutionSerializer

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            EndToEndSolution.objects
            .filter(
                status=EndToEndSolution.Status.PUBLISHED,
            )
            .select_related(
                "primary_product",
            )
            .prefetch_related(
                "solution_products__product",
            )
            .order_by("name")
        )