# ECS Fargate Cluster for Backend Services
# (§9, §10 - FastAPI backend, Celery workers)

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Example Task Definition Skeleton for FastAPI Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "placeholder-image-url" # Replace with ECR image URL
      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "ENVIRONMENT", value = var.environment }
      ]
      secrets = [
        { name = "POSTGRES_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
        { name = "S3_ACCESS_KEY", valueFrom = aws_ssm_parameter.s3_access_key.arn },
        { name = "S3_SECRET_KEY", valueFrom = aws_ssm_parameter.s3_secret_key.arn },
        { name = "FCM_SERVER_KEY", valueFrom = aws_ssm_parameter.fcm_server_key.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}-${var.environment}-backend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# IAM Roles Skeleton
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-${var.environment}-ecs-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Allow ECS Execution Role to read secrets from SSM
resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name = "${var.project_name}-${var.environment}-ecs-ssm-policy"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          aws_ssm_parameter.db_password.arn,
          aws_ssm_parameter.jwt_secret.arn,
          aws_ssm_parameter.s3_access_key.arn,
          aws_ssm_parameter.s3_secret_key.arn,
          aws_ssm_parameter.fcm_server_key.arn
        ]
      }
    ]
  })
}
