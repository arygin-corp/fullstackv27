# demo DNS record admin.demo.data.toyota.com.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/dns"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  record_name = "admin.demo.data.toyota.com"
  zone_id = "Z0836512INFRJWXX8WDG"
}
