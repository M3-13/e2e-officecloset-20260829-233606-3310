"""Tests for registration, login, JWT and account deletion."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend import auth, models
from backend.config import UPLOAD_DIR
from backend.db import get_db
from backend.main import app
from backend.security import create_access_token, decode_token, hash_password, verify_password

REGISTER = {
    "username": "alice",
    "email": "alice@example.com",
    "password": "secret123",
}


@pytest.fixture
def engine(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    models.Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture
def session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def client(session_factory):
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    auth._rate_log.clear()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_register_returns_token(client):
    response = client.post("/api/auth/register", json=REGISTER)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_with_same_data_returns_token(client):
    client.post("/api/auth/register", json=REGISTER)

    response = client.post(
        "/api/auth/login",
        json={"username": REGISTER["username"], "password": REGISTER["password"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_me_returns_user(client):
    client.post("/api/auth/register", json=REGISTER)
    token = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "secret123"},
    ).json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "alice"
    assert body["email"] == "alice@example.com"
    assert isinstance(body["id"], int)


def test_me_requires_auth(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_login_with_wrong_password_rejected(client):
    client.post("/api/auth/register", json=REGISTER)

    response = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "wrong"},
    )

    assert response.status_code == 401


def test_register_duplicate_username_rejected(client):
    client.post("/api/auth/register", json=REGISTER)

    response = client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "other@example.com", "password": "secret123"},
    )

    assert response.status_code == 409


def test_register_duplicate_email_rejected(client):
    client.post("/api/auth/register", json=REGISTER)

    response = client.post(
        "/api/auth/register",
        json={"username": "bob", "email": "alice@example.com", "password": "secret123"},
    )

    assert response.status_code == 409


def test_hash_password_uses_bcrypt_prefix():
    hashed = hash_password("secret123")

    assert hashed.startswith("$2")
    assert verify_password("secret123", hashed)
    assert not verify_password("wrong", hashed)


def test_token_roundtrip():
    token = create_access_token("42")
    claims = decode_token(token)

    assert claims["sub"] == "42"


def test_invalid_token_rejected(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-valid-token"})

    assert response.status_code == 401


def test_rate_limit_blocks_eleventh_login(client):
    client.post("/api/auth/register", json=REGISTER)

    for _ in range(10):
        response = client.post(
            "/api/auth/login",
            json={"username": "alice", "password": "secret123"},
        )
        assert response.status_code == 200

    blocked = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "secret123"},
    )

    assert blocked.status_code == 429


def test_delete_me_removes_account(client):
    client.post("/api/auth/register", json=REGISTER)
    token = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "secret123"},
    ).json()["access_token"]

    response = client.delete("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 204

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 401


def test_delete_me_deletes_image_files(client, session_factory, monkeypatch):
    session = session_factory()
    user = models.User(
        username="alice",
        email="alice@example.com",
        password_hash=hash_password("secret123"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    session.add(
        models.ClothingItem(
            name="Dress",
            category="Kleid",
            image_url="photo.jpg",
            owner_id=user.id,
        )
    )
    session.commit()
    session.close()

    token = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "secret123"},
    ).json()["access_token"]

    calls: list[tuple[str, str]] = []

    def fake_delete_image(filename: str, upload_dir: str) -> None:
        calls.append((filename, upload_dir))

    monkeypatch.setattr(auth, "delete_image", fake_delete_image)

    response = client.delete("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 204
    assert calls == [("photo.jpg", UPLOAD_DIR)]


def test_delete_me_requires_auth(client):
    response = client.delete("/api/auth/me")

    assert response.status_code == 401
