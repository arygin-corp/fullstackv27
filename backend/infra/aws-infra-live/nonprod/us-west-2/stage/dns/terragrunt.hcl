# stage DNS record admin.stage.data.toyota.com.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/dns"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  record_name = "admin.stage.data.toyota.com"
  zone_id = "Z05445923VK2SSXZE0ZDV"
}
