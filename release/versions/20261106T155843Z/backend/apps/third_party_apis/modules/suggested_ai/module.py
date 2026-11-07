from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='suggested_ai';display_name='SuggestedAI';description='SuggestedAI';default_source_name='GDX Data Marketplace';icon_path='images/brands/modules/data-marketplace.png';url_prefix='suggested_ai'+"/";tags=('SuggestedAI',)
registry.register(Module())
