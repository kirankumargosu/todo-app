from pydantic import BaseModel

class DuplicateImage(BaseModel):
    image_id: int
    path: str
    is_primary: bool
    hash_distance: int

    class Config:
        from_attributes = True
