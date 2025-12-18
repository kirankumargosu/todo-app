from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# from app.database import get_db
from app.models import User
# from app.auth_utils import verify_password, create_access_token
from app.schemas import LoginRequest, get_db
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hash: str) -> bool:
    return pwd_context.verify(password, hash)

SECRET_KEY = os.getenv("SECRET_KEY", "HIGHLY_CONFIDENTIAL_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login/")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    print("Login attempt for user:", req.username)
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "role": user.role, "username": user.username}
