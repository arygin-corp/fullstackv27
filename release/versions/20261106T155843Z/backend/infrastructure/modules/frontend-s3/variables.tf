variable "bucket_name" { type=string }
variable "environment" { type=string }
variable "kms_key_arn" { type=string, default=null }
variable "release_retention_days" { type=number, default=180 }
variable "rollback_retention_days" { type=number, default=365 }
variable "tags" { type=map(string), default={} }
