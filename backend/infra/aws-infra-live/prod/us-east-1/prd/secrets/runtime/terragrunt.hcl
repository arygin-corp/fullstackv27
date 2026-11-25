# Production runtime secret.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/runtime-secret"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  secret_name      = "edmp-gdxp-admin-prod-runtime"
  monitoring_token = get_env("MONITORING_TOKEN", "")
  microsoft_app_secret = get_env("MICROSOFT_APP_SECRET", "")
  peoplefinder_microsoft_auth_client_secret = get_env("PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET", "")
  tdsp_pods_username = get_env("TDSP_PODS_USERNAME", "")
  tdsp_pods_password = get_env("TDSP_PODS_PASSWORD", "")
}
