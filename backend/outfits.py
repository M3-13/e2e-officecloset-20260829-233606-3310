"""Outfit routes: create, list, read, update and delete the current user's outfits."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.auth import get_current_user
from backend.db import get_db
from backend.models import ClothingItem, Outfit, User
from backend.schemas import OutfitOut, OutfitRequest

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


def _resolve_owned_items(db: Session, owner_id: int, item_ids: list[int]) -> list[ClothingItem]:
    """Return the clothing items referenced by ``item_ids`` that belong to the user.

    Raises 404 when any requested id does not exist or belongs to another user, so a
    caller can never attach a foreign item to an outfit (AC-10).
    """
    unique_ids = list(dict.fromkeys(item_ids))
    if not unique_ids:
        return []

    items = (
        db.execute(
            select(ClothingItem).where(
                ClothingItem.id.in_(unique_ids),
                ClothingItem.owner_id == owner_id,
            )
        )
        .scalars()
        .all()
    )

    if len(items) != len(unique_ids):
        raise HTTPException(status_code=404, detail="Outfit item not found")

    order = {item_id: index for index, item_id in enumerate(unique_ids)}
    return sorted(items, key=lambda item: order[item.id])


def _get_owned_outfit(db: Session, outfit_id: int, owner_id: int) -> Outfit:
    """Return the outfit with ``outfit_id`` when it belongs to ``owner_id``, else 404."""
    outfit = (
        db.execute(
            select(Outfit)
            .where(Outfit.id == outfit_id, Outfit.owner_id == owner_id)
            .options(selectinload(Outfit.items))
        )
        .scalars()
        .first()
    )
    if outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit


@router.get("", response_model=list[OutfitOut])
def list_outfits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Outfit]:
    outfits = (
        db.execute(
            select(Outfit)
            .where(Outfit.owner_id == current_user.id)
            .options(selectinload(Outfit.items))
            .order_by(Outfit.id)
        )
        .scalars()
        .all()
    )
    return list(outfits)


@router.post("", response_model=OutfitOut, status_code=201)
def create_outfit(
    payload: OutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Outfit:
    items = _resolve_owned_items(db, current_user.id, payload.item_ids)
    outfit = Outfit(name=payload.name, owner_id=current_user.id, items=items)
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return outfit


@router.get("/{outfit_id}", response_model=OutfitOut)
def get_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Outfit:
    return _get_owned_outfit(db, outfit_id, current_user.id)


@router.put("/{outfit_id}", response_model=OutfitOut)
def update_outfit(
    outfit_id: int,
    payload: OutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Outfit:
    outfit = _get_owned_outfit(db, outfit_id, current_user.id)
    items = _resolve_owned_items(db, current_user.id, payload.item_ids)
    outfit.name = payload.name
    outfit.items = items
    db.commit()
    db.refresh(outfit)
    return outfit


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    outfit = _get_owned_outfit(db, outfit_id, current_user.id)
    db.delete(outfit)
    db.commit()
