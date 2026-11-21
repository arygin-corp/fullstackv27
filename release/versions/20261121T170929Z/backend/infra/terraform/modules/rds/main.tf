resource "aws_db_subnet_group" "this" {
  name       = "edmp-gdx-${var.env}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = var.standard_tags
}

# ADDED: Allow DB to accept traffic from the App Security Group
resource "aws_security_group" "rds_sg" {
  name   = "edmp-gdx-${var.env}-rds-sg"
  vpc_id = var.vpc_id
  tags   = var.standard_tags

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id] # This is shared_nonprod_sg.id
  }
}

resource "aws_db_instance" "this" {
  identifier                  = "edmp-gdx-${var.env}-db"
  allocated_storage           = 32
  engine                      = "postgres"
  engine_version              = "17"
  allow_major_version_upgrade = true
  instance_class              = "db.t3.micro"
  db_name                     = var.db_name
  username                    = var.db_user
  password                    = var.db_password
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = [aws_security_group.rds_sg.id] # ADDED
  skip_final_snapshot         = true
  tags                        = var.standard_tags
}