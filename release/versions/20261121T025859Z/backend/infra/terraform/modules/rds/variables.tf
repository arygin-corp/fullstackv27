variable "env" {
  type        = string
  description = "The environment name (e.g., nonprod, prod)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the RDS instance will be deployed"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnets for the DB subnet group"
}

variable "db_name" {
  type = string
}

variable "db_user" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "standard_tags" {
  type = map(string)
}

# --- THE FIX ---
variable "ecs_sg_id" {
  type        = string
  description = "The Security Group ID of the ECS/EC2 app server to allow database access"
}