"""Wardrobe routes: list, filter, create, read, update and delete clothing items."""

import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth import get_current_user
from backend.config import UPLOAD_DIR
from backend.db import get_db
from backend.images import delete_image, save_image, validate_image
from backend.models import CATEGORIES, ClothingItem, User
from backend.schemas import ClothingItemOut

router = APIRouter(prefix="/api/wardrobe", tags=["wardrobe"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def _to_out(item: ClothingItem) -> ClothingItemOut:
    return ClothingItemOut(
        id=item.id,
        name=item.name,
        category=item.category,
        description=item.description,
        image_url=f"/api/wardrobe/items/{item.id}/image" if item.image_url else None,
    )


def enforce_upload_limit(request: Request) -> None:
    """Reject an oversized upload from its Content-Length before the body is buffered."""
    content_length = request.headers.get("content-length")
    if content_length is None:
        return
    try:
        length = int(content_length)
    except ValueError:
        return
    if length > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Bild ist zu groß (max. 5 MB)")


def _get_own_item(item_id: int, user: User, db: Session) -> ClothingItem:
    item = db.scalar(
        select(ClothingItem).where(ClothingItem.id == item_id, ClothingItem.owner_id == user.id)
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Kleidungsstück nicht gefunden")
    return item


@router.get("/categories", response_model=list[str])
def list_categories() -> list[str]:
    return list(CATEGORIES)


@router.get("/items", response_model=list[ClothingItemOut])
def list_items(
    category: str | None = None,
    search: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ClothingItemOut]:
    query = select(ClothingItem).where(ClothingItem.owner_id == user.id)
    if category:
        query = query.where(ClothingItem.category == category)
    if search:
        query = query.where(ClothingItem.name.ilike(f"%{search}%"))
    items = db.scalars(query).all()
    return [_to_out(item) for item in items]


@router.post("/items", response_model=ClothingItemOut, status_code=201)
def create_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    image: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(enforce_upload_limit),
) -> ClothingItemOut:
    if category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="Unbekannte Kategorie")

    content = image.file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Leeres Bild")
    if not validate_image(content):
        raise HTTPException(status_code=415, detail="Nur JPEG oder PNG erlaubt")

    filename = save_image(content, UPLOAD_DIR)

    item = ClothingItem(
        name=name,
        category=category,
        description=description,
        image_url=filename,
        owner_id=user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_out(item)


@router.get("/items/{item_id}", response_model=ClothingItemOut)
def get_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ClothingItemOut:
    return _to_out(_get_own_item(item_id, user, db))


@router.put("/items/{item_id}", response_model=ClothingItemOut)
def update_item(
    item_id: int,
    name: str = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(enforce_upload_limit),
) -> ClothingItemOut:
    item = _get_own_item(item_id, user, db)

    if category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="Unbekannte Kategorie")

    item.name = name
    item.category = category
    item.description = description

    if image is not None:
        content = image.file.read()
        if not content:
            raise HTTPException(status_code=422, detail="Leeres Bild")
        if not validate_image(content):
            raise HTTPException(status_code=415, detail="Nur JPEG oder PNG erlaubt")
        new_filename = save_image(content, UPLOAD_DIR)
        if item.image_url:
            delete_image(item.image_url, UPLOAD_DIR)
        item.image_url = new_filename

    db.commit()
    db.refresh(item)
    return _to_out(item)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    item = _get_own_item(item_id, user, db)
    if item.image_url:
        delete_image(item.image_url, UPLOAD_DIR)
    db.delete(item)
    db.commit()


@router.get("/items/{item_id}/image")
def get_item_image(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    item = _get_own_item(item_id, user, db)
    if not item.image_url:
        raise HTTPException(status_code=404, detail="Kein Bild vorhanden")

    path = os.path.join(UPLOAD_DIR, item.image_url)
    try:
        with open(path, "rb") as handle:
            content = handle.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Bild nicht gefunden") from None

    media_type = "image/png" if content.startswith(_PNG_MAGIC) else "image/jpeg"
    return Response(content=content, media_type=media_type)
