from dataclasses import dataclass
from django.conf import settings
from django.core.cache import cache
@dataclass(frozen=True)
class SettingStatus:name:str;category:str;configured:bool;secret:bool=False
class ModuleOperationalStatus:
    def __init__(self,module):self.module=module
    def settings(self):return tuple([SettingStatus(n,"Required",bool(getattr(settings,n,""))) for n in self.module.required_setting_names]+[SettingStatus(n,"Required",bool(getattr(settings,n,"")),True) for n in self.module.required_secret_names]+[SettingStatus(n,"Optional",bool(getattr(settings,n,""))) for n in self.module.optional_setting_names]+[SettingStatus(n,"Defaulted",True) for n in self.module.defaulted_settings])
    def missing_required(self):return tuple(x.name for x in self.settings() if x.category=="Required" and not x.configured)
    def unconfigured_optional(self):return tuple(x.name for x in self.settings() if x.category=="Optional" and not x.configured)
    def cache_status(self):return tuple((label,"Cached" if cache.get(key) is not None else "Not cached") for label,key in self.module.cache_entries)
