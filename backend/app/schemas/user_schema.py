from pydantic import BaseModel
# from app.database import SessionLocal
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
    class Config:
        from_attributes = True

class RoleUpdateRequest(BaseModel):
    username: str
    role: str  # "admin" or "user"
    