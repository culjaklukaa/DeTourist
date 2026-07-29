# DeTourist Backend

This is the FastAPI backend for the DeTourist application.

## API Conventions

### `/v1/` URL Prefix (§13)

All public backend endpoints intended for the mobile client must be prefixed with `/v1/` (e.g., `/v1/trips`, `/v1/auth/login`). 

This convention serves two key purposes:
1. **API Gateway Routing:** The AWS API Gateway (defined in `infra/terraform/api_gateway.tf`) uses the `ANY /v1/{proxy+}` route key to explicitly forward traffic to this backend service via the VPC Link.
2. **Future Versioning:** It guarantees a path for backward-incompatible changes in the future (e.g., `/v2/`) without breaking older versions of the mobile app that users haven't updated yet.

**Note on internal endpoints:**
Internal operational endpoints — such as health checks (`/health`) used by the ALB/ECS, or OpenAPI documentation (`/docs`, `/openapi.json`) — should remain at the root level. Because they lack the `/v1/` prefix, they are naturally shielded from the public internet by the API Gateway routing rules.
