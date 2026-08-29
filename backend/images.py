"""Image storage helpers (stubs — implemented by the wardrobe ticket)."""


def validate_image(content: bytes) -> bool:
    """Return True when ``content`` is a valid JPG/PNG by its magic bytes."""
    raise NotImplementedError("wardrobe #9 implements this")


def save_image(content: bytes, upload_dir: str) -> str:
    """Persist ``content`` under ``upload_dir`` and return the stored filename."""
    raise NotImplementedError("wardrobe #9 implements this")


def delete_image(filename: str, upload_dir: str) -> None:
    """Remove the stored image ``filename`` from ``upload_dir``."""
    raise NotImplementedError("wardrobe #9 implements this")
