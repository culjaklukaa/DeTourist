# HTTP API Gateway (v2) acting as the public entry point
# Routes traffic to internal ALB via VPC Link
# (§9 - API Gateway provisioned in front of FastAPI service)

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"] # Restrict in production
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_security_group" "vpc_link" {
  name        = "${var.project_name}-${var.environment}-vpclink-sg"
  description = "Security group for API Gateway VPC Link"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_apigatewayv2_vpc_link" "main" {
  name               = "${var.project_name}-${var.environment}-vpc-link"
  security_group_ids = [aws_security_group.vpc_link.id]
  subnet_ids         = module.vpc.private_subnets
}

resource "aws_apigatewayv2_integration" "backend" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = aws_lb_listener.http.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.main.id
}

# The /v1/ URL-prefix convention is handled here to route to the backend
resource "aws_apigatewayv2_route" "backend_proxy" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /v1/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.backend.id}"
}

output "api_endpoint" {
  description = "The public URL of the API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}
