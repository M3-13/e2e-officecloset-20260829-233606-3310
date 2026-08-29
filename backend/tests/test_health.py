"""Tests for the health endpoint, CORS and the mounted routers."""

from fastapi.testclient import TestClient

from backend.config import FRONTEND_ORIGIN
from backend.main import app


def test_health_returns_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_allows_configured_origin() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health", headers={"Origin": FRONTEND_ORIGIN})

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == FRONTEND_ORIGIN


def test_cors_rejects_unknown_origin() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health", headers={"Origin": "http://evil.example"})

    assert "access-control-allow-origin" not in response.headers


def test_routers_are_mounted() -> None:
    with TestClient(app) as client:
        for path in [
            "/api/wardrobe/categories",
            "/api/wardrobe/items",
            "/api/wardrobe/items/1/image",
            "/api/outfits",
        ]:
            assert client.get(path).status_code != 404, f"{path} is not wired"
