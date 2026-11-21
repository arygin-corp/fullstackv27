from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='onets_add_to_cart';
 display_name='OneTS Add To Cart';
 description='OneTS Add To Cart';
 default_source_name='OneTS';
 icon_path='images/brands/modules/servicenow.png';
 url_prefix='onets_add_to_cart'+"/";
 tags=('OneTS Add To Cart',)
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
     "label": "Last Sync",
     "source": "last_success_at",
     "format": "datetime",
     "hide_if_empty": True,
    },
    {
     "label": "Last Failure",
     "source": "last_failure_at",
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
