import asyncio
import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select, func
from app.core.database import async_session_maker
from app.models.poi import POI
from app.services.search_service import search_service

async def sync_meilisearch():
    print("Starting Meilisearch sync...")
    
    # Optional: Configure Meilisearch index settings (filterable/sortable attributes)
    search_service.poi_index.update_filterable_attributes(['category', 'significance_tier', '_geo'])
    search_service.poi_index.update_sortable_attributes(['_geo'])
    
    async with async_session_maker() as session:
        # We use PostGIS ST_Y and ST_X to extract lat/lng directly during the query
        # to construct the `_geo` field required by Meilisearch for spatial sorting.
        query = select(
            POI.id,
            POI.name,
            POI.category,
            POI.tags,
            POI.significance_tier,
            func.ST_Y(POI.location).label("lat"),
            func.ST_X(POI.location).label("lng")
        )
        
        result = await session.execute(query)
        rows = result.all()
        
        documents = []
        for row in rows:
            doc = {
                "id": str(row.id),
                "name": row.name,
                "category": row.category,
                "significance_tier": row.significance_tier,
                "tags": row.tags,
            }
            
            # Format geo point for Meilisearch
            if row.lat is not None and row.lng is not None:
                doc["_geo"] = {
                    "lat": row.lat,
                    "lng": row.lng
                }
                
            documents.append(doc)
            
        print(f"Fetched {len(documents)} POIs from PostgreSQL. Sending to Meilisearch...")
        
        # Batch index into Meilisearch
        batch_size = 1000
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            task = search_service.poi_index.add_documents(batch)
            print(f"Indexed batch {i//batch_size + 1} (task uid: {task.task_uid})")
            
        print("Sync task submitted to Meilisearch queue successfully.")

if __name__ == "__main__":
    asyncio.run(sync_meilisearch())
