from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry
class Module(ThirdPartyApiModule):
 key='tbdp_pods';display_name='TBDP Pods';description='TBDP Pods';default_source_name='OneTS';icon_path='images/brands/modules/servicenow.png';url_prefix='tbdp_pods'+"/";tags=('TBDP Pods',)
registry.register(Module())
