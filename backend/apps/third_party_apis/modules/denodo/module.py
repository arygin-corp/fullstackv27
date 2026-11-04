from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='denodo';
 display_name='Denodo Metadata Views';
 description='Denodo Metadata Views';
 default_source_name='Denodo';
 icon_path='images/brands/modules/denodo.png';
 url_prefix='denodo'+"/";
 tags=('Denodo Metadata Views',)
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
     "label": "Protocol",
     "source": "upstream.method",
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
     "label": "Last Health Check",
     "source": "health.last_checked_at",
     "format": "datetime",
     "hide_if_empty": True,
    },
   ),
  },
  "settings": {
   "sections": (
    "status",
    "governance",
    "upstream",
    "capabilities",
    "configuration",
    "health",
   ),
  },
  "documentation": {
   "sections": (
    "governance",
    "capabilities",
    "environments",
    "upstream",
    "configuration",
    "health",
   ),
  },
 }
registry.register(Module())
