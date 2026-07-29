# Secrets Management (SSM Parameter Store)
# (§10 - DB creds, JWT signing secret, S3 credentials, FCM server key)

# Database Credentials
resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.project_name}/${var.environment}/db_password"
  description = "PostgreSQL database password"
  type        = "SecureString"
  value       = "CHANGE_ME_INITIAL_VALUE" # To be rotated/changed manually
  
  lifecycle {
    ignore_changes = [value] # Don't overwrite the real password on subsequent applies
  }
}

# JWT Signing Secret (Custom Auth - Phase 0)
resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_name}/${var.environment}/jwt_secret"
  description = "Secret key for signing JWT tokens"
  type        = "SecureString"
  value       = "CHANGE_ME_INITIAL_VALUE"
  
  lifecycle {
    ignore_changes = [value]
  }
}

# S3 Credentials
# Note: For ECS Tasks, using Task IAM Roles is preferred over long-lived access keys.
# Included here per specification, but consider migrating to task_role_arn policies.
resource "aws_ssm_parameter" "s3_access_key" {
  name        = "/${var.project_name}/${var.environment}/s3_access_key"
  description = "S3 Access Key"
  type        = "SecureString"
  value       = "CHANGE_ME_INITIAL_VALUE"
  
  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "s3_secret_key" {
  name        = "/${var.project_name}/${var.environment}/s3_secret_key"
  description = "S3 Secret Key"
  type        = "SecureString"
  value       = "CHANGE_ME_INITIAL_VALUE"
  
  lifecycle {
    ignore_changes = [value]
  }
}

# Firebase Cloud Messaging Server Key (Phase 4)
resource "aws_ssm_parameter" "fcm_server_key" {
  name        = "/${var.project_name}/${var.environment}/fcm_server_key"
  description = "FCM Server Key for Push Notifications"
  type        = "SecureString"
  value       = "CHANGE_ME_INITIAL_VALUE"
  
  lifecycle {
    ignore_changes = [value]
  }
}
