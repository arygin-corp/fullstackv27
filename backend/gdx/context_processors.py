from django.conf import settings


def app_display_version(request):
    """
    Expose the human-readable application release version
    to Django HTML templates.
    """

    return {
        "app_version": settings.APP_DISPLAY_VERSION,
    }