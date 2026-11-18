variable "db_secret_arn" {
  type        = string
  description = "The ARN of the secret that contains the database connection string"
}
variable "env" { type = string }
variable "env_group" { type = string }
variable "sqs_arn" { type = string }
variable "sns_arn" { type = string }
variable "standard_tags" { type = map(string) }
