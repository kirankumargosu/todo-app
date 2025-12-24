from pydantic import BaseModel
from typing import Optional

# from app.database import SessionLocal

class TaskBase(BaseModel):
    title: str
    completed: bool = False
    link_url: Optional[str] = None
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    class Config:
        from_attributes = True
