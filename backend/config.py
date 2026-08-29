"""Configuration loaded from the environment.

Every value has a working development default so the app boots without any
manual setup. ``SECRET_KEY`` is generated randomly per start when it is not
provided (see the run contract in ``RUN.json``).
"""

import os
import secrets

DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./wardrobe.db")
UPLOAD_DIR: str = os.environ.get("UPLOAD_DIR", "./uploads")
FRONTEND_ORIGIN: str = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
VITE_API_URL: str = os.environ.get("VITE_API_URL", "http://localhost:8000")


def _load_secret_key() -> str:
    return os.environ.get("SECRET_KEY") or secrets.token_hex(32)


SECRET_KEY: str = _load_secret_key()
