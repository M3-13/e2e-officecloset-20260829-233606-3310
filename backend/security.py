"""Password hashing and JWT helpers (stubs — implemented by the auth ticket)."""


def hash_password(password: str) -> str:
    """Hash a plaintext password and return the salted hash string."""
    raise NotImplementedError("auth #3 implements this")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Return True when ``plain_password`` matches ``password_hash``."""
    raise NotImplementedError("auth #3 implements this")


def create_access_token(subject: str) -> str:
    """Create a signed JWT whose ``sub`` claim is ``subject`` (the user id)."""
    raise NotImplementedError("auth #3 implements this")


def decode_token(token: str) -> dict[str, str]:
    """Decode and verify a JWT, returning its claims (including ``sub``)."""
    raise NotImplementedError("auth #3 implements this")
