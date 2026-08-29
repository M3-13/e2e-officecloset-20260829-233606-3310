"""Authentication router, OAuth2 scheme and current-user dependency."""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Resolve the authenticated user from a bearer token (auth ticket stub)."""
    raise NotImplementedError("auth #3 implements this")
