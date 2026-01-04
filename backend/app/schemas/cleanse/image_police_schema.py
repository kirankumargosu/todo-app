from pydantic import BaseModel
from typing import List
from datetime import datetime

class ImageDatasetItem(BaseModel):
    path: str
    width: int
    height: int
    file_size: int
    phash: str
    has_face: bool
    blur_score: float
    checksum: str
    orientation: int
    tags: List[str] = []
    duplicates: List[int] = []

class ImageDataset(BaseModel):
    folder: str
    scan_started_at: datetime
    scan_finished_at: datetime
    images: List[ImageDatasetItem]
