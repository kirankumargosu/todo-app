from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from starlette.requests import Request
from pathlib import Path
import os
import mimetypes
from PIL import Image, ExifTags

media_router = APIRouter(prefix="/media", tags=["media"])

# ---------------------------------------------------
# Configuration
# ---------------------------------------------------
MEDIA_ROOT = Path(os.getenv("MEDIA_MOUNT", "/mnt/media")).resolve()
THUMBNAIL_DIR = MEDIA_ROOT / ".thumbnails"
THUMBNAIL_DIR.mkdir(exist_ok=True, parents=True)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTS = {".mp4", ".mkv", ".avi", ".mov"}

THUMBNAIL_SIZE = (300, 300)  # small resolution for faster loading

# ---------------------------------------------------
# Utilities
# ---------------------------------------------------
def safe_resolve(relative_path: str) -> Path:
    resolved = (MEDIA_ROOT / relative_path).resolve()
    if not str(resolved).startswith(str(MEDIA_ROOT)):
        raise HTTPException(status_code=403, detail="Invalid path")
    return resolved

def generate_thumbnail(file_path: Path, thumb_path: Path, size=THUMBNAIL_SIZE):
    """Create a thumbnail with EXIF orientation fix."""
    img = Image.open(file_path)

    # Fix orientation according to EXIF
    try:
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == "Orientation":
                break
        exif = img._getexif()
        if exif is not None:
            orientation_value = exif.get(orientation)
            if orientation_value == 3:
                img = img.rotate(180, expand=True)
            elif orientation_value == 6:
                img = img.rotate(270, expand=True)
            elif orientation_value == 8:
                img = img.rotate(90, expand=True)
    except Exception:
        pass  # ignore if no EXIF

    img.thumbnail(size)
    thumb_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(thumb_path)

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
            items.append({"name": item.name, "type": "folder"})
        elif item.suffix.lower() in IMAGE_EXTS:
            items.append({"name": item.name, "type": "image"})
        elif item.suffix.lower() in VIDEO_EXTS:
            items.append({"name": item.name, "type": "video"})
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

    if file_path.suffix.lower() in VIDEO_EXTS:
        # StreamingResponse for videos
        return StreamingResponse(open(file_path, "rb"), media_type=media_type)

    # Images → FileResponse
    return FileResponse(file_path, media_type=media_type, filename=file_path.name)

# ---------------------------------------------------
# 3️⃣ Thumbnail endpoint
# ---------------------------------------------------
@media_router.get("/thumbnail")
def get_thumbnail(path: str = Query(...)):
    file_path = safe_resolve(path)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if file_path.suffix.lower() not in IMAGE_EXTS:
        # Non-image files → return original file
        media_type, _ = mimetypes.guess_type(str(file_path))
        media_type = media_type or "application/octet-stream"
        return FileResponse(file_path, media_type=media_type, filename=file_path.name)

    # Create thumbnail path inside .thumbnails
    thumb_path = THUMBNAIL_DIR / f"{file_path.relative_to(MEDIA_ROOT).as_posix().replace('/', '__')}"
    if not thumb_path.exists():
        generate_thumbnail(file_path, thumb_path)

    media_type, _ = mimetypes.guess_type(str(thumb_path))
    media_type = media_type or "image/jpeg"

    return FileResponse(thumb_path, media_type=media_type, filename=file_path.name)
