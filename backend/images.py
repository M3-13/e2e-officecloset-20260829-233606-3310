"""Image storage helpers: validation, persistence and removal."""

import contextlib
import os
import uuid

_JPEG_MAGIC = b"\xff\xd8\xff"
_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def validate_image(content: bytes) -> bool:
    """Return True when ``content`` is a valid JPEG/PNG by its magic bytes."""
    return content.startswith(_JPEG_MAGIC) or content.startswith(_PNG_MAGIC)


def save_image(content: bytes, upload_dir: str) -> str:
    """Persist ``content`` under ``upload_dir`` and return the stored filename."""
    os.makedirs(upload_dir, exist_ok=True)
    ext = "png" if content.startswith(_PNG_MAGIC) else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(upload_dir, filename), "wb") as handle:
        handle.write(content)
    return filename


def delete_image(filename: str, upload_dir: str) -> None:
    """Remove the stored image ``filename`` from ``upload_dir`` (missing is fine)."""
    if not filename:
        return
    with contextlib.suppress(FileNotFoundError):
        os.remove(os.path.join(upload_dir, filename))
