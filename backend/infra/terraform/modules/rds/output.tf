output "db_endpoint" {
  # Removes the port number so the Django URL stays clean
  value = element(split(":", aws_db_instance.postgres.endpoint), 0)
}