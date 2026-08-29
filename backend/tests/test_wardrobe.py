"""Tests for the wardrobe routes and image storage helpers."""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import wardrobe
from backend.auth import get_current_user
from backend.db import Base, get_db
from backend.images import delete_image, save_image, validate_image
from backend.main import app
from backend.models import ClothingItem, User

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 256
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 256
TEXT = b"definitely not an image"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(wardrobe, "UPLOAD_DIR", str(tmp_path / "uploads"))

    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = session_factory()

    alice = User(username="alice", email="alice@example.com", password_hash="x")
    bob = User(username="bob", email="bob@example.com", password_hash="x")
    session.add_all([alice, bob])
    session.commit()

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: alice

    with TestClient(app) as c:
        yield c, alice, bob, session

    app.dependency_overrides.clear()
    session.close()
    engine.dispose()


def _create_item(client, name="Shirt", category="Oberteil", image=JPEG, filename="shirt.jpg"):
    return client.post(
        "/api/wardrobe/items",
        data={"name": name, "category": category},
        files={"image": (filename, image, "image/jpeg")},
    )


# --- images.py ---


def test_validate_image_accepts_jpeg_and_png() -> None:
    assert validate_image(JPEG) is True
    assert validate_image(PNG) is True


def test_validate_image_rejects_other_content() -> None:
    assert validate_image(TEXT) is False
    assert validate_image(b"") is False


def test_save_and_delete_image(tmp_path) -> None:
    upload_dir = str(tmp_path / "uploads")
    filename = save_image(PNG, upload_dir)
    assert filename.endswith(".png")
    assert os.path.exists(os.path.join(upload_dir, filename))

    delete_image(filename, upload_dir)
    assert not os.path.exists(os.path.join(upload_dir, filename))


def test_delete_image_missing_is_silent(tmp_path) -> None:
    delete_image("nope.png", str(tmp_path))


# --- wardrobe routes ---


def test_categories_returns_fixed_list(client) -> None:
    c, _, _, _ = client
    response = c.get("/api/wardrobe/categories")
    assert response.status_code == 200
    assert response.json() == [
        "Oberteil",
        "Unterteil",
        "Kleid",
        "Schuhe",
        "Accessoire",
        "Jacke",
    ]


def test_create_item_with_image(client) -> None:
    c, _, _, _ = client
    response = _create_item(c)
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Shirt"
    assert body["category"] == "Oberteil"
    assert body["image_url"] == f"/api/wardrobe/items/{body['id']}/image"


def test_create_item_rejects_non_image(client) -> None:
    c, _, _, _ = client
    response = _create_item(c, image=TEXT, filename="x.txt")
    assert response.status_code == 415


def test_create_item_rejects_unknown_category(client) -> None:
    c, _, _, _ = client
    response = _create_item(c, category="Hut")
    assert response.status_code == 422


def test_list_items_filters_by_category_and_search(client) -> None:
    c, _, _, _ = client
    _create_item(c, name="Rotes Shirt", category="Oberteil")
    _create_item(c, name="Blaue Hose", category="Unterteil")
    _create_item(c, name="Rote Schuhe", category="Schuhe")

    response = c.get("/api/wardrobe/items", params={"category": "Oberteil"})
    assert response.status_code == 200
    names = [i["name"] for i in response.json()]
    assert names == ["Rotes Shirt"]

    response = c.get("/api/wardrobe/items", params={"search": "rote"})
    names = [i["name"] for i in response.json()]
    assert sorted(names) == ["Rote Schuhe", "Rotes Shirt"]

    response = c.get("/api/wardrobe/items", params={"category": "Schuhe", "search": "rote"})
    names = [i["name"] for i in response.json()]
    assert names == ["Rote Schuhe"]


def test_items_only_show_own_items(client) -> None:
    c, alice, bob, _session = client
    _create_item(c, name="Eigenes Shirt", category="Oberteil")

    app.dependency_overrides[get_current_user] = lambda: bob
    response = c.get("/api/wardrobe/items")
    assert response.status_code == 200
    assert response.json() == []

    app.dependency_overrides[get_current_user] = lambda: alice
    response = c.get("/api/wardrobe/items")
    assert [i["name"] for i in response.json()] == ["Eigenes Shirt"]


def test_get_foreign_item_returns_404(client) -> None:
    c, _alice, bob, _session = client
    created = _create_item(c, name="Shirt", category="Oberteil").json()
    item_id = created["id"]

    app.dependency_overrides[get_current_user] = lambda: bob
    assert c.get(f"/api/wardrobe/items/{item_id}").status_code == 404
    assert c.get(f"/api/wardrobe/items/{item_id}/image").status_code == 404
    assert c.delete(f"/api/wardrobe/items/{item_id}").status_code == 404


def test_get_missing_item_returns_404(client) -> None:
    c, _, _, _ = client
    assert c.get("/api/wardrobe/items/9999").status_code == 404


def test_update_item_replaces_image_and_removes_old_file(client) -> None:
    c, _, _, session = client
    created = _create_item(c, name="Shirt", category="Oberteil").json()
    item_id = created["id"]

    item = session.get(ClothingItem, item_id)
    old_filename = item.image_url
    upload_dir = wardrobe.UPLOAD_DIR
    assert os.path.exists(os.path.join(upload_dir, old_filename))

    response = c.put(
        f"/api/wardrobe/items/{item_id}",
        data={"name": "Neues Shirt", "category": "Kleid", "description": "beschreibung"},
        files={"image": ("new.png", PNG, "image/png")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Neues Shirt"
    assert body["category"] == "Kleid"
    assert body["description"] == "beschreibung"

    new_filename = session.get(ClothingItem, item_id).image_url
    assert new_filename != old_filename
    assert not os.path.exists(os.path.join(upload_dir, old_filename))
    assert os.path.exists(os.path.join(upload_dir, new_filename))


def test_update_item_without_image_keeps_old_image(client) -> None:
    c, _, _, session = client
    created = _create_item(c, name="Shirt", category="Oberteil").json()
    item_id = created["id"]
    old_filename = session.get(ClothingItem, item_id).image_url

    response = c.put(
        f"/api/wardrobe/items/{item_id}",
        data={"name": "Umbenannt", "category": "Oberteil"},
    )
    assert response.status_code == 200
    assert session.get(ClothingItem, item_id).image_url == old_filename


def test_delete_item_removes_image_file(client) -> None:
    c, _, _, session = client
    created = _create_item(c, name="Shirt", category="Oberteil").json()
    item_id = created["id"]
    filename = session.get(ClothingItem, item_id).image_url
    upload_dir = wardrobe.UPLOAD_DIR
    assert os.path.exists(os.path.join(upload_dir, filename))

    assert c.delete(f"/api/wardrobe/items/{item_id}").status_code == 204
    assert session.get(ClothingItem, item_id) is None
    assert not os.path.exists(os.path.join(upload_dir, filename))


def test_get_image_returns_correct_bytes(client) -> None:
    c, _, _, _ = client
    created = _create_item(c, name="Shirt", category="Oberteil", image=PNG, filename="x.png").json()

    response = c.get(f"/api/wardrobe/items/{created['id']}/image")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/png")
    assert response.content == PNG


def test_get_image_for_item_without_image_returns_404(client) -> None:
    c, _, _, session = client
    created = _create_item(c).json()
    item = session.get(ClothingItem, created["id"])
    item.image_url = None
    session.commit()

    assert c.get(f"/api/wardrobe/items/{created['id']}/image").status_code == 404


def test_oversized_upload_returns_413(client, monkeypatch) -> None:
    monkeypatch.setattr(wardrobe, "MAX_IMAGE_BYTES", 100)
    c, _, _, _ = client
    response = _create_item(c, image=b"\xff\xd8\xff" + b"\x00" * 10000)
    assert response.status_code == 413
