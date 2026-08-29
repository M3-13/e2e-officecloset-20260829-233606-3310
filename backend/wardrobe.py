"""Wardrobe routes (stubs — implemented by the wardrobe ticket)."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from backend.schemas import ClothingItemOut

router = APIRouter(prefix="/api/wardrobe", tags=["wardrobe"])


@router.get("/categories", response_model=list[str])
def list_categories() -> list[str]:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.get("/items", response_model=list[ClothingItemOut])
def list_items(category: str | None = None, search: str | None = None) -> list[ClothingItemOut]:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.post("/items", response_model=ClothingItemOut, status_code=201)
def create_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    image: UploadFile = File(...),
) -> ClothingItemOut:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.get("/items/{item_id}", response_model=ClothingItemOut)
def get_item(item_id: int) -> ClothingItemOut:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.put("/items/{item_id}", response_model=ClothingItemOut)
def update_item(
    item_id: int,
    name: str = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    image: UploadFile | None = File(None),
) -> ClothingItemOut:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int) -> None:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")


@router.get("/items/{item_id}/image")
def get_item_image(item_id: int) -> Response:
    raise HTTPException(status_code=501, detail="wardrobe #9 implements this")
