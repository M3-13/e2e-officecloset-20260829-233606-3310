"""Authentication router, OAuth2 scheme and current-user dependency."""

import time
from contextlib import suppress

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.config import UPLOAD_DIR
from backend.db import get_db
from backend.images import delete_image
from backend.models import ClothingItem, User
from backend.schemas import LoginRequest, RegisterRequest, TokenOut, UserOut
from backend.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

_RATE_LIMIT_SECONDS = 60.0
_RATE_LIMIT_MAX = 10
_rate_log: dict[tuple[str, str], list[float]] = {}


def _client_ip(request: Request) -> str:
    if request.client is not None:
        return request.client.host
    return "unknown"


def _rate_limited(client_ip: str, endpoint: str) -> bool:
    """Record a request and return True once the per-minute limit is exceeded."""
    now = time.monotonic()
    key = (client_ip, endpoint)
    timestamps = _rate_log.setdefault(key, [])
    timestamps[:] = [t for t in timestamps if now - t < _RATE_LIMIT_SECONDS]
    if len(timestamps) >= _RATE_LIMIT_MAX:
        return True
    timestamps.append(now)
    return False


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from a bearer token, else 401."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        claims = decode_token(token)
    except JWTError as exc:
        raise credentials_error from exc

    subject = claims.get("sub")
    if subject is None:
        raise credentials_error

    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        raise credentials_error from exc

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error
    return user


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenOut:
    if _rate_limited(_client_ip(request), "register"):
        raise HTTPException(status_code=429, detail="Too many requests")

    username_taken = db.execute(
        select(User).where(User.username == payload.username)
    ).scalar_one_or_none()
    if username_taken is not None:
        raise HTTPException(status_code=409, detail="Username already taken")

    email_taken = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if email_taken is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenOut(access_token=create_access_token(str(user.id)), token_type="bearer")


@router.post("/login", response_model=TokenOut)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenOut:
    if _rate_limited(_client_ip(request), "login"):
        raise HTTPException(status_code=429, detail="Too many requests")

    user = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    return TokenOut(access_token=create_access_token(str(user.id)), token_type="bearer")


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    user = db.get(User, current_user.id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    items = db.execute(select(ClothingItem).where(ClothingItem.owner_id == user.id)).scalars().all()

    db.delete(user)
    db.commit()

    for item in items:
        if item.image_url:
            with suppress(FileNotFoundError):
                delete_image(item.image_url, UPLOAD_DIR)
