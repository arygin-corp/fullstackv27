variable "bucket_name" {type=string}
variable "environment" {type=string}
variable "task_role_arn" {type=string}
variable "tags" {type=map(string),default={}}
