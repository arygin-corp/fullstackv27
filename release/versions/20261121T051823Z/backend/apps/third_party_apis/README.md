# third_party_apis

Host Django app for deployed third-party API integration modules.

## Install

Add `apps.third_party_apis.apps.ThirdPartyApisConfig` to `INSTALLED_APPS`, include
`apps.third_party_apis.urls` under the desired root URL, then run migrations.

## Add a module

Create `modules/<module_key>/module.py`. Implement `ThirdPartyApiModule`, expose URL
patterns, instantiate the module, and call `registry.register(instance)` at import time.
Modules are discovered at Django startup. Their database rows are synchronized after
migrations and are disabled by default.

Admin configuration is operational only. Keep credentials and environment hostnames in
Django settings/environment secrets, not in the JSON config field.
