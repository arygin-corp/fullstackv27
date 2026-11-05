resource "aws_secretsmanager_secret" "this"{name=var.name;recovery_window_in_days=30;tags=merge(var.tags,{"tmna:environment"=var.environment});lifecycle{prevent_destroy=true}}
resource "aws_secretsmanager_secret_version" "this"{secret_id=aws_secretsmanager_secret.this.id;secret_string=jsonencode(var.secret_value)}
