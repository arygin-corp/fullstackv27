variable "replication_group_id"{type=string}
variable "subnet_group_name"{type=string}
variable "security_group_ids"{type=list(string)}
variable "node_type"{type=string,default="cache.t4g.small"}
variable "environment"{type=string}
variable "tags"{type=map(string),default={}}
