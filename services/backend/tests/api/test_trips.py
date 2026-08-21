import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_trip(client: AsyncClient):
    payload = {
        "title": "Paris Adventure",
        "description": "Weekend getaway",
        "destination_name": "Paris, France",
        "longitude": 2.3522,
        "latitude": 48.8566,
        "start_date": "2023-10-01",
        "end_date": "2023-10-05",
        "interests": ["art", "food"],
        "pacing_tier": "moderate"
    }
    response = await client.post("/api/v1/trips", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["destination_name"] == payload["destination_name"]
    assert data["longitude"] == payload["longitude"]
    assert data["latitude"] == payload["latitude"]
    assert "id" in data

@pytest.mark.asyncio
async def test_read_trips(client: AsyncClient):
    # Create trip first
    payload = {
        "title": "Rome Trip",
        "destination_name": "Rome",
        "pacing_tier": "packed"
    }
    create_resp = await client.post("/api/v1/trips", json=payload)
    assert create_resp.status_code == 201
    
    # Read trips
    response = await client.get("/api/v1/trips")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(trip["title"] == "Rome Trip" for trip in data)

@pytest.mark.asyncio
async def test_update_trip(client: AsyncClient):
    # Create
    create_resp = await client.post("/api/v1/trips", json={
        "title": "London",
        "destination_name": "London, UK"
    })
    trip_id = create_resp.json()["id"]
    
    # Update
    update_payload = {"title": "London Updated", "pacing_tier": "relaxed"}
    update_resp = await client.put(f"/api/v1/trips/{trip_id}", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "London Updated"
    assert update_resp.json()["pacing_tier"] == "relaxed"

@pytest.mark.asyncio
async def test_delete_trip(client: AsyncClient):
    # Create
    create_resp = await client.post("/api/v1/trips", json={
        "title": "Berlin",
        "destination_name": "Berlin, Germany"
    })
    trip_id = create_resp.json()["id"]
    
    # Delete
    del_resp = await client.delete(f"/api/v1/trips/{trip_id}")
    assert del_resp.status_code == 204
    
    # Ensure deleted
    get_resp = await client.get(f"/api/v1/trips/{trip_id}")
    assert get_resp.status_code == 404
