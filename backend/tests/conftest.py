import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.main import app
from app.core.database import get_db


@pytest.fixture(autouse=True)
def mock_db_session():
    """
    Provide a mock database session for fast route-level testing
    without requiring a running PostgreSQL server.
    """
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    mock_session.execute.return_value = mock_result
    mock_session.commit.return_value = None
    mock_session.rollback.return_value = None

    async def override_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db
    yield mock_session
    app.dependency_overrides.pop(get_db, None)
