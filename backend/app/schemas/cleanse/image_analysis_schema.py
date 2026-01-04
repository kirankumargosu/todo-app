from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ImageAnalysisOut(BaseModel):
    image_id: int

    phash: Optional[str]

    has_face: Optional[bool]
    is_blurry: Optional[bool]
    blur_score: Optional[float]

    analyzed_at: Optional[datetime]

    class Config:
        from_attributes = True
