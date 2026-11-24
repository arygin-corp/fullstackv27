# dev DNS record admin.dev.data.toyota.com.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/dns"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  record_name = "admin.dev.data.toyota.com"
  zone_id = "Z05286522RI3CIPII1TYY"
}
