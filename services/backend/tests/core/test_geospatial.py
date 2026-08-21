import pytest
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.poi import POI, POISource

@pytest.mark.asyncio
async def test_postgis_distance(db_session: AsyncSession):
    """
    Test basic PostGIS geospatial functionality.
    Creates two POIs and ensures ST_Distance works.
    """
    # Eiffel Tower: 48.8584 N, 2.2945 E
    poi1 = POI(
        name="Eiffel Tower",
        category="Attractions",
        location=func.ST_SetSRID(func.ST_MakePoint(2.2945, 48.8584), 4326),
        source=POISource.osm
    )
    
    # Louvre Museum: 48.8606 N, 2.3376 E
    poi2 = POI(
        name="Louvre Museum",
        category="Attractions",
        location=func.ST_SetSRID(func.ST_MakePoint(2.3376, 48.8606), 4326),
        source=POISource.osm
    )
    
    db_session.add_all([poi1, poi2])
    await db_session.commit()
    
    # Calculate distance using PostGIS
    # ST_Distance on geography gives distance in meters
    query = select(
        func.ST_Distance(
            func.ST_GeographyFromText(func.ST_AsText(poi1.location)),
            func.ST_GeographyFromText(func.ST_AsText(poi2.location))
        )
    )
    
    result = await db_session.execute(query)
    distance_meters = result.scalar()
    
    # Distance should be around 3.1 kilometers (3100 meters +/- 100 meters)
    assert distance_meters is not None
    assert 3000 < distance_meters < 3300
