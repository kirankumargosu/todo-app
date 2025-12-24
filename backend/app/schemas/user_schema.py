from pydantic import BaseModel
from typing import List, Optional
from app.schemas.task_schema import TaskOut

class LoginRequest(BaseModel):
    username: str
    password: str

# Pydantic schema for registration
class RegisterRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    tasks: Optional[List[TaskOut]] = []

    class Config:
        from_attributes = True

class RoleUpdateRequest(BaseModel):
    username: str
    role: str  # "admin" or "user"
    