# RDS PostgreSQL Database with PostGIS
# (§9, §10 - PostgreSQL + PostGIS)

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Allow inbound traffic from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [] # Add ECS task security group ID here
  }
}

resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-${var.environment}-db"
  engine            = "postgres"
  engine_version    = "16" # Align with docker-compose.yml local version
  instance_class    = "db.t4g.micro" # Cost-effective for dev
  allocated_storage = 20

  db_name  = "detourist"
  username = "detourist_admin"
  # Manage password via Secrets Manager in production, not hardcoded
  password = "placeholder_password_change_me" 

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot = var.environment == "dev" ? true : false
  publicly_accessible = false
}
