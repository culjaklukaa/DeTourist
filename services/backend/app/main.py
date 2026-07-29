from fastapi import FastAPI

from app.core.config import settings
from app.api.routers import auth, users, trips

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for DeTourist",
    version="0.1.0",
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["healthcheck"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
