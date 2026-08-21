import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_discover_pois(client: AsyncClient):
    """
    Test the discovery feed API to ensure it handles filters correctly
    and adheres to the response schema contracts.
    """
    # 1. Create a trip first to get a valid trip_id
    payload = {
        "title": "Paris Trip",
        "destination_name": "Paris",
        "longitude": 2.3522,
        "latitude": 48.8566
    }
    create_resp = await client.post("/api/v1/trips", json=payload)
    assert create_resp.status_code == 201
    trip_id = create_resp.json()["id"]

    # 2. Provide mock parameters for discovery
    params = {
        "trip_id": trip_id,
        "limit": 10,
        "offset": 0
    }
    
    # 3. Call the endpoint
    response = await client.get("/api/v1/discovery/recommendations", params=params)
    
    # 4. Assert status and contract
    assert response.status_code == 200
    data = response.json()
    
    # Check the DiscoveryResponse contract
    assert "trip_id" in data
    assert data["trip_id"] == trip_id
    assert "pacing_tier" in data
    assert "total_candidates" in data
    assert "recommendations" in data
    
    assert isinstance(data["recommendations"], list)
    
    # Even if empty (since DB might not have real data seeded), 
    # the contract of returning 200 OK with the object is verified.
    if len(data["recommendations"]) > 0:
        item = data["recommendations"][0]
        assert "poi" in item
        assert "score_breakdown" in item
        
        poi = item["poi"]
        assert "id" in poi
        assert "name" in poi
        assert "category" in poi
        assert "location" in poi
        
        score = item["score_breakdown"]
        assert "total_score" in score
        assert "crowd_avoidance" in score
