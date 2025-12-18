from pydantic import BaseModel
from app.database import SessionLocal, engine

class LoginRequest(BaseModel):
    username: str
    password: str

class TaskBase(BaseModel):
    title: str
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    class Config:
        orm_mode = True


class TaskBase(BaseModel):
    title: str
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int

    class Config:
        orm_mode = True

# Pydantic schema for registration
class RegisterRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        orm_mode = True

class RoleUpdateRequest(BaseModel):
    username: str
    role: str  # "admin" or "user"
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()