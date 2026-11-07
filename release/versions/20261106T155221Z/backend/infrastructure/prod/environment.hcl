locals {
  environment = "prod"
  admin_host = "admin.data.toyota.com"
  angular_origin = "https://data.toyota.com"
  listener_priority = 1
  frontend_bucket_name = "edmp-prod-gdx"
  application_bucket_name = "edmp-gdxp-admin-prod-471550468381-use1"
  db_name = "edmp_gdxp_admin_prod"
  secret_name = "edmp-gdxp-admin-prod-runtime"
  settings_module = "gdx.settings.prod"
  image_uri = get_env("GDXP_ADMIN_IMAGE_URI", "")
  secret_values = {
    GDX_SECRET_KEY = get_env("GDX_SECRET_KEY", "")
    DB_USER = get_env("DB_USER", "")
    DB_PASSWORD = get_env("DB_PASSWORD", "")
    MICROSOFT_APP_SECRET = get_env("MICROSOFT_APP_SECRET", "")
    PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET = get_env("PEOPLEFINDER_MICROSOFT_AUTH_CLIENT_SECRET", "")
    TDSP_PODS_USERNAME = get_env("TDSP_PODS_USERNAME", "")
    TDSP_PODS_PASSWORD = get_env("TDSP_PODS_PASSWORD", "")
    MONITORING_TOKEN = get_env("MONITORING_TOKEN", "")
  }
}
