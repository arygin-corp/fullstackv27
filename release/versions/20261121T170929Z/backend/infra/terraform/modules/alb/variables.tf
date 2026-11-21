
variable "env" { type = string }
variable "env_group" { type = string }
variable "alb_listener_arn" { type = string }
variable "path_prefix" { type = string }
variable "target_group_arn" { type = string }
variable "standard_tags" { type = map(string) }
