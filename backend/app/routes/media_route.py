from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from starlette.requests import Request
from pathlib import Path
import os
import mimetypes

media_router = APIRouter(prefix="/media", tags=["media"])

# ---------------------------------------------------
# Configuration
# ---------------------------------------------------
MEDIA_ROOT = Path(os.getenv("MEDIA_MOUNT", "/mnt/media")).resolve()

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTS = {".mp4", ".mkv", ".avi", ".mov"}


# ---------------------------------------------------
# Utilities
# ---------------------------------------------------
def safe_resolve(relative_path: str) -> Path:
    """
    Resolve a path safely under MEDIA_ROOT and prevent traversal attacks.
    """
    resolved = (MEDIA_ROOT / relative_path).resolve()

    if not str(resolved).startswith(str(MEDIA_ROOT)):
        raise HTTPException(status_code=403, detail="Invalid path")

    return resolved


# ---------------------------------------------------
# 1️⃣ Browse folders & media
# ---------------------------------------------------
@media_router.get("/browse")
def browse_media(path: str = Query(default="")):
    base_path = safe_resolve(path)

    if not base_path.exists() or not base_path.is_dir():
        raise HTTPException(status_code=404, detail="Folder not found")

    items = []

    for item in sorted(base_path.iterdir()):
        if item.is_dir():
            items.append({
                "name": item.name,
                "type": "folder",
            })
        elif item.suffix.lower() in IMAGE_EXTS:
            items.append({
                "name": item.name,
                "type": "image",
            })
        elif item.suffix.lower() in VIDEO_EXTS:
            items.append({
                "name": item.name,
                "type": "video",
            })

    return items


# ---------------------------------------------------
# 2️⃣ Stream image / video
# ---------------------------------------------------
@media_router.get("/stream")
def stream_media(request: Request, path: str = Query(...)):
    file_path = safe_resolve(path)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    media_type, _ = mimetypes.guess_type(str(file_path))
    media_type = media_type or "application/octet-stream"

    # 🔹 Videos → StreamingResponse (supports browser playback)
    if file_path.suffix.lower() in VIDEO_EXTS:
        return StreamingResponse(
            open(file_path, "rb"),
            media_type=media_type,
        )

    # 🔹 Images → FileResponse
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=file_path.name,
    )


# ---------------------------------------------------
# 3️⃣ (Optional) Thumbnail endpoint
# ---------------------------------------------------
@media_router.get("/thumbnail")
def get_thumbnail(path: str = Query(...)):
    """
    Placeholder thumbnail endpoint.
    Currently returns the original image.
    """
    file_path = safe_resolve(path)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    media_type, _ = mimetypes.guess_type(str(file_path))

    return FileResponse(
        file_path,
        media_type=media_type,
        filename=file_path.name,
    )
