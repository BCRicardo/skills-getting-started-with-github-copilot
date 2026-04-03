import pytest
from fastapi.testclient import TestClient
from src.app import app

@pytest.fixture
def client():
    """Cliente de teste para a aplicação FastAPI"""
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_activities():
    """Reseta o banco de dados entre testes"""
    from src.app import activities
    original = {k: v.copy() for k, v in activities.items()}
    yield
    activities.clear()
    activities.update(original)
