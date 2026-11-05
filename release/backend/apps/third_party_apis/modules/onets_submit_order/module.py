from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='onets_submit_order';
 display_name='OneTS Submit Order';
 description='OneTS Submit Order';
 default_source_name='OneTS';
 icon_path='images/brands/modules/servicenow.png';
 url_prefix='onets_submit_order'+"/";
 tags=('OneTS Submit Order',)
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
