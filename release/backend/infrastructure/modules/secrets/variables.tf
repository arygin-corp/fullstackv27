variable "name"{type=string}
variable "environment"{type=string}
variable "secret_value"{type=map(string),sensitive=true}
variable "tags"{type=map(string),default={}}
