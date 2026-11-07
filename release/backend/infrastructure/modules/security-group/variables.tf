variable "name"{type=string}
variable "description"{type=string}
variable "vpc_id"{type=string}
variable "ingress_rules"{type=list(object({from_port=number,to_port=number,protocol=string,source_security_group_id=optional(string),cidr_blocks=optional(list(string),[])})),default=[]}
variable "egress_rules"{type=list(object({from_port=number,to_port=number,protocol=string,destination_security_group_id=optional(string),cidr_blocks=optional(list(string),[])})),default=[]}
variable "environment"{type=string}
variable "tags"{type=map(string),default={}}
