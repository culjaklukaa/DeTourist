import os
import json
import asyncio
import sys

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import async_session_maker
from app.models.poi import POI, POISource

INPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_pois.json")

async def seed_pois():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Could not find processed data at {INPUT_FILE}")
        print("Please run cleanup_osm_data.py first.")
        sys.exit(1)

    print(f"Loading data from {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        pois_data = json.load(f)
        
    print(f"Loaded {len(pois_data)} POIs. Beginning database insertion...")

    async with async_session_maker() as session:
        # Optional: you might want to truncate or drop existing OSM POIs before seeding
        # For this script, we'll just insert everything. Consider clearing first in a real scenario:
        # await session.execute(sa.delete(POI).where(POI.source == POISource.osm))
        
        batch_size = 500
        batch = []
        
        for index, poi_raw in enumerate(pois_data):
            poi = POI(
                name=poi_raw.get('name'),
                category=poi_raw.get('category'),
                # WKT string format: SRID=4326;POINT(lon lat)
                location=f"SRID=4326;POINT({poi_raw['lon']} {poi_raw['lat']})",
                source=POISource.osm,
                tags=poi_raw.get('tags', {})
            )
            batch.append(poi)
            
            if len(batch) >= batch_size:
                session.add_all(batch)
                await session.commit()
                print(f"Inserted {index + 1} / {len(pois_data)}...")
                batch = []
                
        if batch:
            session.add_all(batch)
            await session.commit()
            print(f"Inserted {len(pois_data)} / {len(pois_data)}...")
            
    print("Seeding completed successfully!")

def main():
    asyncio.run(seed_pois())

if __name__ == '__main__':
    main()
