variable "name"{type=string}
variable "subnet_ids"{type=list(string)}
variable "security_group_ids"{type=list(string)}
variable "certificate_arn"{type=string}
variable "waf_web_acl_arn"{type=string,default=""}
variable "environment"{type=string}
variable "tags"{type=map(string),default={}}
