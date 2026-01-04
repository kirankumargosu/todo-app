from pydantic import BaseModel
from typing import Optional

class ImageOut(BaseModel):
    id: int
    path: str
    width: Optional[int]
    height: Optional[int]
    file_size: Optional[int]

    has_face: Optional[bool]
    is_blurry: Optional[bool]
    blur_score: Optional[float]

    class Config:
        from_attributes = True
