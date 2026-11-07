variable "policy_name" {type=string}
variable "role_name" {type=string}
variable "bucket_names" {type=list(string)}
variable "attach_enabled" {type=bool,default=true}
variable "environment" {type=string}
variable "tags" {type=map(string),default={}}
