from django.contrib.auth import logout, get_user_model
from django.contrib import messages
from django.shortcuts import redirect

User = get_user_model()

class MicrosoftEmailValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only check authenticated users
        if request.user.is_authenticated:
            email = request.user.email

            # Check if the user exists in our pre-approved system
            # We filter by email and check if the record actually exists in our DB
            user_exists = User.objects.filter(email__iexact=email).exists()

            if not user_exists:
                messages.error(request,
                               f"The account {email} is not authorized to access this system. Please contact an administrator.")
                logout(request)
                return redirect('login')

        response = self.get_response(request)
        return response