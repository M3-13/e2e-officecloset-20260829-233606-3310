"""Tests for the outfit CRUD endpoints (create, list, read, update, delete)."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.auth import get_current_user
from backend.db import Base, get_db
from backend.main import app
from backend.models import ClothingItem, Outfit, User, outfit_items

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)


@pytest.fixture
def db() -> Generator[Session]:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def _clean_tables(db: Session) -> Generator[None]:
    for table in (
        outfit_items,
        Outfit.__table__,
        ClothingItem.__table__,
        User.__table__,
    ):
        db.execute(table.delete())
    db.commit()
    yield


@pytest.fixture
def client(db: Session) -> Generator[TestClient]:
    def override_get_db() -> Generator[Session]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def _make_user(db: Session, username: str = "alice") -> User:
    user = User(username=username, email=f"{username}@example.com", password_hash="x")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_item(db: Session, owner_id: int, name: str = "Shirt") -> ClothingItem:
    item = ClothingItem(name=name, category="Oberteil", owner_id=owner_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _auth(client: TestClient, user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: user


def test_list_outfits_empty(client: TestClient, db: Session) -> None:
    user = _make_user(db)
    _auth(client, user)

    response = client.get("/api/outfits")

    assert response.status_code == 200
    assert response.json() == []


def test_create_outfit(client: TestClient, db: Session) -> None:
    user = _make_user(db)
    item1 = _make_item(db, user.id, "Bluse")
    item2 = _make_item(db, user.id, "Rock")
    _auth(client, user)

    response = client.post("/api/outfits", json={"name": "Büro", "item_ids": [item1.id, item2.id]})

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Büro"
    assert [item["id"] for item in body["items"]] == [item1.id, item2.id]
    assert body["items"][0]["name"] == "Bluse"
    assert "category" in body["items"][0]


def test_list_outfits_only_returns_own(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")
    bob = _make_user(db, "bob")
    item = _make_item(db, alice.id, "Bluse")

    _auth(client, alice)
    created = client.post("/api/outfits", json={"name": "A", "item_ids": [item.id]})
    assert created.status_code == 201

    _auth(client, bob)
    response = client.get("/api/outfits")

    assert response.status_code == 200
    assert response.json() == []


def test_create_outfit_with_foreign_item_returns_404(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")
    bob = _make_user(db, "bob")
    bob_item = _make_item(db, bob.id, "Fremd")

    _auth(client, alice)
    response = client.post("/api/outfits", json={"name": "X", "item_ids": [bob_item.id]})

    assert response.status_code == 404


def test_create_outfit_with_unknown_item_returns_404(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")

    _auth(client, alice)
    response = client.post("/api/outfits", json={"name": "X", "item_ids": [9999]})

    assert response.status_code == 404


def test_get_own_outfit(client: TestClient, db: Session) -> None:
    user = _make_user(db)
    item = _make_item(db, user.id, "Bluse")
    _auth(client, user)
    created = client.post("/api/outfits", json={"name": "Büro", "item_ids": [item.id]})
    outfit_id = created.json()["id"]

    response = client.get(f"/api/outfits/{outfit_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Büro"
    assert [i["id"] for i in body["items"]] == [item.id]


def test_get_foreign_outfit_returns_404(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")
    bob = _make_user(db, "bob")
    item = _make_item(db, alice.id, "Bluse")
    _auth(client, alice)
    created = client.post("/api/outfits", json={"name": "A", "item_ids": [item.id]})
    outfit_id = created.json()["id"]

    _auth(client, bob)
    response = client.get(f"/api/outfits/{outfit_id}")

    assert response.status_code == 404


def test_update_outfit(client: TestClient, db: Session) -> None:
    user = _make_user(db)
    item1 = _make_item(db, user.id, "Bluse")
    item2 = _make_item(db, user.id, "Rock")
    _auth(client, user)
    created = client.post("/api/outfits", json={"name": "Büro", "item_ids": [item1.id]})
    outfit_id = created.json()["id"]

    response = client.put(
        f"/api/outfits/{outfit_id}", json={"name": "Abend", "item_ids": [item2.id]}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Abend"
    assert [i["id"] for i in body["items"]] == [item2.id]


def test_update_foreign_outfit_returns_404(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")
    bob = _make_user(db, "bob")
    item = _make_item(db, alice.id, "Bluse")
    _auth(client, alice)
    created = client.post("/api/outfits", json={"name": "A", "item_ids": [item.id]})
    outfit_id = created.json()["id"]

    _auth(client, bob)
    response = client.put(f"/api/outfits/{outfit_id}", json={"name": "B", "item_ids": []})

    assert response.status_code == 404


def test_delete_outfit(client: TestClient, db: Session) -> None:
    user = _make_user(db)
    item = _make_item(db, user.id, "Bluse")
    _auth(client, user)
    created = client.post("/api/outfits", json={"name": "Büro", "item_ids": [item.id]})
    outfit_id = created.json()["id"]

    response = client.delete(f"/api/outfits/{outfit_id}")

    assert response.status_code == 204
    assert client.get(f"/api/outfits/{outfit_id}").status_code == 404


def test_delete_foreign_outfit_returns_404(client: TestClient, db: Session) -> None:
    alice = _make_user(db, "alice")
    bob = _make_user(db, "bob")
    item = _make_item(db, alice.id, "Bluse")
    _auth(client, alice)
    created = client.post("/api/outfits", json={"name": "A", "item_ids": [item.id]})
    outfit_id = created.json()["id"]

    _auth(client, bob)
    response = client.delete(f"/api/outfits/{outfit_id}")

    assert response.status_code == 404
