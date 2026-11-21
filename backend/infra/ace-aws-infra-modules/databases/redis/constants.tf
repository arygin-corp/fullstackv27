locals {
  private_subnet_attribute = "sn-private"
  resource_types = {
    security_group    = "sg"
    name              = "rc"
    subnet_group      = "sn"
    kms_key           = "km"
    log_group         = "lg"
    user_group        = "ug"
    redis-access      = "ra"
    redis-access-role = "rr"
  }
}