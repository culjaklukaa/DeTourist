import asyncio
from datetime import datetime, timedelta, timezone
from celery import Celery
from celery.schedules import crontab
from sqlalchemy import select

from app.core.config import settings
from app.core.database import async_session_maker
from app.models.poi import POI
from app.models.crowd_signal import CrowdSignal
from app.core.crowd_index import calculate_crowd_index

# Initialize Celery app
celery_app = Celery(
    "crowd_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.timezone = "UTC"

# Schedule the task to run automatically (e.g., at the top of every hour)
celery_app.conf.beat_schedule = {
    "recompute-crowd-index-hourly": {
        "task": "app.worker.crowd_index_recompute.recompute_crowd_signals",
        "schedule": crontab(minute=0),
    }
}

async def _recompute_crowd_signals_async():
    """
    Async implementation of the recompute task.
    In Phase 1A, this iterates through POIs and precomputes their heuristic 
    CrowdIndex for upcoming time slots so that the Route Intelligence Engine
    can quickly query the `crowd_signals` table instead of computing on the fly.
    """
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    
    # Precompute the next 24 hours
    time_slots = [now + timedelta(hours=i) for i in range(24)]
    
    async with async_session_maker() as session:
        # Fetch active POIs (Limit to a subset in production to prevent memory overload)
        result = await session.execute(select(POI))
        pois = result.scalars().all()
        
        batch = []
        for poi in pois:
            for slot in time_slots:
                score = calculate_crowd_index(poi, slot)
                
                # In a real app, this should be an ON CONFLICT DO UPDATE upsert.
                # For this skeleton implementation, we instantiate the signal models.
                signal = CrowdSignal(
                    poi_id=poi.id,
                    time_bucket=slot,
                    crowd_index=score,
                    source="heuristic_v1",
                    sample_size=0
                )
                batch.append(signal)
                
        # Bulk save
        if batch:
            session.add_all(batch)
            await session.commit()
        
    return len(batch)

@celery_app.task
def recompute_crowd_signals():
    """
    Celery task entrypoint.
    Executes the async DB queries inside an event loop.
    """
    count = asyncio.run(_recompute_crowd_signals_async())
    return f"Successfully computed and saved {count} CrowdSignal rows."
