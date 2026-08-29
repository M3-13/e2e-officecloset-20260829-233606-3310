"""Outfit routes (stubs — implemented by the outfits ticket)."""

from fastapi import APIRouter, HTTPException

from backend.schemas import OutfitOut, OutfitRequest

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.get("", response_model=list[OutfitOut])
def list_outfits() -> list[OutfitOut]:
    raise HTTPException(status_code=501, detail="outfits #4 implements this")


@router.post("", response_model=OutfitOut, status_code=201)
def create_outfit(payload: OutfitRequest) -> OutfitOut:
    raise HTTPException(status_code=501, detail="outfits #4 implements this")


@router.get("/{outfit_id}", response_model=OutfitOut)
def get_outfit(outfit_id: int) -> OutfitOut:
    raise HTTPException(status_code=501, detail="outfits #4 implements this")


@router.put("/{outfit_id}", response_model=OutfitOut)
def update_outfit(outfit_id: int, payload: OutfitRequest) -> OutfitOut:
    raise HTTPException(status_code=501, detail="outfits #4 implements this")


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(outfit_id: int) -> None:
    raise HTTPException(status_code=501, detail="outfits #4 implements this")
