locals {
  environment = "demo"
  admin_host = "admin.demo.data.toyota.com"
  angular_origin = "https://demo.data.toyota.com"
  listener_priority = 1
  frontend_bucket_name = "edmp-nonprod-demo-gdx"
  application_bucket_name = "edmp-gdxp-admin-demo-963334842848-usw2"
  db_name = "edmp_gdxp_admin_demo"
  secret_name = "edmp-gdxp-admin-demo-runtime"
  settings_module = "gdx.settings.demo"
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
