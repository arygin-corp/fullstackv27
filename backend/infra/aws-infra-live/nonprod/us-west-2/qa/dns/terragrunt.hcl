# qa DNS record admin.qa.data.toyota.com.

terraform {
  source = "${dirname(find_in_parent_folders())}/modules/dns"
}

include {
  path = find_in_parent_folders()
}

inputs = {
  record_name = "admin.qa.data.toyota.com"
  zone_id = "Z07056893PYOYHNHDX3X0"
}
