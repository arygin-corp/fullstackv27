locals {
  environment = "dev"
  admin_host = "admin.dev.data.toyota.com"
  angular_origin = "https://dev.data.toyota.com"
  listener_priority = 2
  frontend_bucket_name = "edmp-nonprod-dev-gdx"
  application_bucket_name = "edmp-gdxp-admin-dev-963334842848-usw2"
  db_name = "edmp_gdxp_admin_dev"
  secret_name = "edmp-gdxp-admin-dev-runtime"
  settings_module = "gdx.settings.dev"
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
