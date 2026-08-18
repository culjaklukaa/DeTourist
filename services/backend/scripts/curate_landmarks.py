import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.poi import POI

# Mapping of keywords (to match in POI name) to their significance tier
LANDMARKS = {
    # Tier 5: UNESCO & Global Icons
    "Stari Most": 5,
    "Old Bridge": 5,
    "Mehmed Paša": 5,
    "Radimlja": 5,
    "Baščaršija": 5,
    
    # Tier 4: Major National Landmarks
    "Gazi Husrev": 4,
    "Sebilj": 4,
    "Latin Bridge": 4,
    "Latinska ćuprija": 4,
    "Tunnel of Hope": 4,
    "Tunel Spasa": 4,
    "Vijećnica": 4,
    "City Hall": 4,
    "Žuta Tabija": 4,
    "Yellow Fortress": 4,
    "Vrelo Bosne": 4,
    "Kravica": 4,
    "Pliva": 4,
    "Tjentište": 4,
    "Štrbački buk": 4,
    "Trebević": 4,
    "Kastel": 4,
    "Blagaj": 4,
    "Apparition Hill": 4,
    "Tito's Bunker": 4
}

async def curate_landmarks():
    print("Starting landmark curation...")
    async with async_session_maker() as session:
        result = await session.execute(select(POI).where(POI.name.isnot(None)))
        pois = result.scalars().all()
        
        updated_count = 0
        
        for poi in pois:
            if not poi.name:
                continue
                
            for keyword, tier in LANDMARKS.items():
                if keyword.lower() in poi.name.lower():
                    # Only update if tier is higher or not set
                    if poi.significance_tier is None or poi.significance_tier < tier:
                        poi.significance_tier = tier
                        updated_count += 1
                        print(f"Tagged '{poi.name}' with tier {tier} (matched '{keyword}')")
                        break
        
        if updated_count > 0:
            await session.commit()
            print(f"Successfully curated {updated_count} landmarks.")
        else:
            print("No landmarks were updated (none matched or already tagged).")

if __name__ == "__main__":
    asyncio.run(curate_landmarks())
