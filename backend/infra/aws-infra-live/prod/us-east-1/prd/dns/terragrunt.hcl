# Production admin DNS record.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/dns"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  record_name = "admin.data.toyota.com"
  zone_id = "Z011351814R04VAHWC1K7"
}
