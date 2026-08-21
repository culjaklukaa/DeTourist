import pytest
from unittest.mock import patch
from app.worker.crowd_index_recompute import recompute_crowd_signals, _recompute_crowd_signals_async
from app.models.crowd_signal import CrowdSignal
from app.models.poi import POI, POISource
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_celery_crowd_index_recompute_logic(db_session: AsyncSession, monkeypatch):
    """
    Test the inner async logic of the Celery worker task.
    """
    poi = POI(
        name="Test Attraction",
        category="Attractions",
        location=func.ST_SetSRID(func.ST_MakePoint(1.0, 1.0), 4326),
        source=POISource.osm,
        significance_tier=3
    )
    db_session.add(poi)
    await db_session.commit()
    
    from tests.conftest import TestingSessionLocal
    monkeypatch.setattr("app.worker.crowd_index_recompute.async_session_maker", TestingSessionLocal)
    
    count = await _recompute_crowd_signals_async()
    assert count > 0
    
    query = select(CrowdSignal).where(CrowdSignal.poi_id == poi.id)
    signals = (await db_session.execute(query)).scalars().all()
    
    assert len(signals) == 24
    for signal in signals:
        assert signal.crowd_index >= 0.0
        assert signal.source == "heuristic_v1"

def test_celery_task_registration(celery_eager):
    """
    Test that the task is correctly registered in Celery and can be called.
    We mock the async portion to avoid nested event loop errors in eager mode.
    """
    with patch("app.worker.crowd_index_recompute._recompute_crowd_signals_async") as mock_async:
        with patch("app.worker.crowd_index_recompute.asyncio.run") as mock_run:
            mock_run.return_value = 24
            
            # This tests Celery eager execution
            result = recompute_crowd_signals.delay()
            
            assert result.successful()
            assert result.result == "Successfully computed and saved 24 CrowdSignal rows."
            mock_run.assert_called_once()
