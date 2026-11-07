variable "name_prefix"{type=string}
variable "secret_arn"{type=string}
variable "bucket_arn"{type=string}
variable "environment"{type=string}
variable "tags"{type=map(string),default={}}
