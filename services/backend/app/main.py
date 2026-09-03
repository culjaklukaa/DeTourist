from fastapi import FastAPI

from app.core.config import settings
from app.api.routers import auth, users, trips, routes, pois, discovery, visits, crowd_signals, maps

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for DeTourist",
    version="0.1.0",
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(visits.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=f"{settings.API_V1_STR}/routes", tags=["routes"])
app.include_router(pois.router, prefix=f"{settings.API_V1_STR}/pois", tags=["pois"])
app.include_router(discovery.router, prefix=f"{settings.API_V1_STR}/discovery", tags=["discovery"])
app.include_router(crowd_signals.router, prefix=f"{settings.API_V1_STR}")
app.include_router(maps.router, prefix=f"{settings.API_V1_STR}/maps", tags=["maps"])

@app.get("/health", tags=["healthcheck"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
