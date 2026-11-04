from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='people_finder';
 display_name='People Finder';
 description='People Finder';
 default_source_name='Microsoft Graph';
 icon_path='images/brands/modules/microsoft.png';
 url_prefix='people_finder'+"/";
 tags=('People Finder',)
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
registry.register(Module())
