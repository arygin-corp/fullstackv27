from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='people_finder';
 display_name='People Finder';
 description='People Finder';
 default_source_name='Microsoft Graph';
 icon_path='images/brands/modules/microsoft.png';
 url_prefix='people-finder/';
 frontend_path='search/gac/user/';
 frontend_method='GET';
 frontend_authentication='Django authentication';
 upstream_provider='Microsoft Graph';
 tags=('People Finder',)
 endpoints=(
  {
   "name": "Search users",
   "route_name": "people_finder_directory:tenant_user_lookup",
   "method": "GET",
   "authentication": "Django authentication",
   "parameters": ("q", "page_size"),
  },
 )
 presentation = {
  "card": {
   "fields": (
    {
     "label": "Provider",
     "source": "upstream.provider",
     "format": "text",
     "hide_if_empty": True,
    },
    {
     "label": "Configuration",
     "source": "configuration.status",
     "format": "status",
     "hide_if_empty": True,
    },
    {
     "label": "Last Lookup",
     "source": "last_success_at",
     "format": "datetime",
     "hide_if_empty": True,
    },
    {
     "label": "Health",
     "source": "health.status",
     "format": "status",
     "hide_if_empty": True,
    },
   ),
  },
  "settings": {
   "sections": (
    "status",
    "governance",
    "upstream",
    "configuration",
    "health",
   ),
  },
  "documentation": {
   "sections": (
    "governance",
    "capabilities",
    "upstream",
    "configuration",
    "health",
   ),
  },
 }
 def public_endpoint(self):
  return "/api/integrations/people-finder/search/gac/user/"
registry.register(Module())
