import importlib
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gdx.settings")

django_asgi_application = get_asgi_application()

try:
    from channels.auth import AuthMiddlewareStack
    from channels.routing import ProtocolTypeRouter, URLRouter
    from channels.security.websocket import AllowedHostsOriginValidator
except ImportError:
    application = django_asgi_application
else:
    websocket_urlpatterns = []
    routing_module = os.getenv("GDX_WEBSOCKET_ROUTING_MODULE", "")
    if routing_module:
        module = importlib.import_module(routing_module)
        websocket_urlpatterns = getattr(module, "websocket_urlpatterns", [])

    if websocket_urlpatterns:
        application = ProtocolTypeRouter(
            {
                "http": django_asgi_application,
                "websocket": AllowedHostsOriginValidator(
                    AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
                ),
            }
        )
    else:
        application = django_asgi_application
