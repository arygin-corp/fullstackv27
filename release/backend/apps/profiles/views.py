# apps/profiles/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Q
from .forms import ProfileForm
from .models import Profile
from django.http import JsonResponse
from django.shortcuts import redirect

# Import library utilities
from microsoft_authentication.auth.auth_utils import (
    get_django_user,
    get_token_from_code,
    get_user,
)

def microsoft_callback(request):
    try:
        # This library function checks the session for a matching 'state'
        result = get_token_from_code(request)
    except ValueError:
        # If the session was lost (state missing), redirect back to login
        messages.error(request, "Session timed out or domain mismatch. Please use 'localhost:8000' consistently.")
        return redirect('login')

    if "error" in result:
        error_msg = result.get('error_description', result.get('error'))
        messages.error(request, f"Microsoft Auth Error: {error_msg}")
        return redirect('login')

    ms_user = get_user(result["access_token"])
    email = ms_user.get("mail") or ms_user.get("userPrincipalName")

    # The rest of your existing logic...
    user = get_django_user(email=email)
    if user:
        profile, created = Profile.objects.get_or_create(user=user)
        if profile.is_verified:
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            from gdx.views import home_for

            return redirect(home_for(user))
        else:
            messages.warning(request, f"Your account ({email}) is pending verification.")
            return redirect('profiles:request_access')

    messages.error(request, "This account is not registered. Please request access.")
    return redirect('profiles:request_access')


def request_access(request):
    """Page where users are sent if their email isn't in the DB."""
    return render(request, 'profiles/request_access.html')

@login_required
def edit_profile(request):
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated successfully!')
            return redirect('profiles:edit_profile')
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'profiles/edit_profile.html', {'form': form})


def profile_detail(request, username):
    # Ensure the User exists first
    user = get_object_or_404(User, username=username)

    # Try to get the profile, create one if it doesn't exist
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        # If a user exists but no profile, create a default one
        profile = Profile.objects.create(user=user)
        # You might want to log this or add a message for admin review
        messages.info(request, f"A profile was created for user {username}.")

    return render(request, 'profiles/profile_detail.html', {'user': user, 'profile': profile})


def user_list(request):
    query = request.GET.get('q')
    users = User.objects.filter(is_active=True).order_by('username')

    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        )

    context = {
        'users': users,
        'query': query,
    }
    return render(request, 'profiles/user_list.html', context)