from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .choices import AwsEnvironment, AwsResourceType
from .forms import AwsEnvironmentConfigForm, AwsResourceConfigForm
from .selectors import (
    connectable_services,
    ensure_environment_configs,
    environment_config,
    parity_matrix,
    resource_groups,
)


def _valid_environment(value):
    values = {item.value for item in AwsEnvironment}
    if value not in values:
        raise Http404("Unknown AWS environment")
    return value


@staff_member_required
def index(request):
    environments = ensure_environment_configs()
    selected = request.GET.get("environment") or AwsEnvironment.DEV
    _valid_environment(selected)
    current = environment_config(selected)

    return render(
        request,
        "third_party_apis/aws/index.html",
        {
            "environments": environments,
            "selected_environment": selected,
            "current_environment": current,
            "groups": resource_groups(selected),
        },
    )


@staff_member_required
def environment_settings(request, environment):
    environment = _valid_environment(environment)
    current = environment_config(environment)

    if request.method == "POST":
        form = AwsEnvironmentConfigForm(request.POST, instance=current)
        if form.is_valid():
            form.save()
            messages.success(request, f"{current.get_environment_display()} AWS environment settings saved.")
            return redirect(f"{reverse('third_party_api_aws:index')}?environment={environment}")
    else:
        form = AwsEnvironmentConfigForm(instance=current)

    return render(
        request,
        "third_party_apis/aws/environment_form.html",
        {"form": form, "environment": current},
    )


@staff_member_required
def resource_create(request, environment):
    environment = _valid_environment(environment)
    current = environment_config(environment)

    requested_type = request.GET.get("resource_type", "")
    if requested_type not in AwsResourceType.values:
        requested_type = ""

    if request.method == "POST":
        form = AwsResourceConfigForm(request.POST)
        if form.is_valid():
            resource = form.save(commit=False)
            resource.environment = current
            resource.save()
            messages.success(request, "AWS resource configuration created.")
            return redirect("third_party_api_aws:resource_detail", pk=resource.pk)
    else:
        initial = {"region": current.region}
        if requested_type:
            initial["resource_type"] = requested_type
        form = AwsResourceConfigForm(initial=initial)

    return render(
        request,
        "third_party_apis/aws/resource_form.html",
        {
            "form": form,
            "environment": current,
            "resource": None,
            "selected_type": requested_type,
        },
    )


@staff_member_required
def resource_list(request, environment):
    environment = _valid_environment(environment)
    current = environment_config(environment)
    return render(
        request,
        "third_party_apis/aws/resource_list.html",
        {
            "environments": ensure_environment_configs(),
            "environment": current,
            "selected_environment": environment,
            "service_groups": connectable_services(current),
        },
    )


@staff_member_required
def resource_detail(request, pk):
    resource = get_object_or_404(AwsResourceConfig.objects.select_related("environment"), pk=pk)

    if request.method == "POST":
        form = AwsResourceConfigForm(request.POST, instance=resource)
        if form.is_valid():
            form.save()
            messages.success(request, "AWS resource configuration saved.")
            return redirect("third_party_api_aws:resource_detail", pk=resource.pk)
    else:
        form = AwsResourceConfigForm(instance=resource)

    return render(
        request,
        "third_party_apis/aws/resource_form.html",
        {"form": form, "environment": resource.environment, "resource": resource},
    )


@staff_member_required
def parity(request):
    environments = ensure_environment_configs()
    return render(
        request,
        "third_party_apis/aws/parity.html",
        {
            "environments": environments,
            "matrix": parity_matrix(environments),
        },
    )
