"""Password hashing and JWT helpers."""

from datetime import UTC, datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from backend.config import SECRET_KEY

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password and return the salted bcrypt hash string."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Return True when ``plain_password`` matches ``password_hash``."""
    try:
        return pwd_context.verify(plain_password, password_hash)
    except ValueError:
        return False


def create_access_token(subject: str) -> str:
    """Create a signed JWT whose ``sub`` claim is ``subject`` (the user id)."""
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, str]:
    """Decode and verify a JWT, returning its claims (including ``sub``)."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
