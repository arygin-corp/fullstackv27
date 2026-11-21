class ThirdPartyApiError(Exception):
    pass


class ModuleNotInstalledError(ThirdPartyApiError):
    pass


class ModuleDisabledError(ThirdPartyApiError):
    pass
