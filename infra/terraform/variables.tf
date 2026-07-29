variable "aws_region" {
  description = "AWS region for infrastructure"
  type        = string
  default     = "eu-central-1" # Good default for European pilot market (Bosnia)
}

variable "project_name" {
  description = "Project name used for tagging and resource naming"
  type        = string
  default     = "detourist"
}

variable "environment" {
  description = "Environment (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}
