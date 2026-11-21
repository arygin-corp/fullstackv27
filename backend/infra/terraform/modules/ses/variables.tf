variable "domains" {
  type = list(string)
}

variable "configuration_set" {
  type = string
}

variable "name_prefix" {
  type = string
}

variable "buckets" {
  type = list(string)
}

variable "standard_tags" {
  type = map(string)
}
