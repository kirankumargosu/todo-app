from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.models import User
from typing import List
from app.schemas import LoginRequest, RegisterRequest, UserOut, RoleUpdateRequest, get_db
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login/")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    print("Login attempt for user:", req.username)
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "role": user.role, "username": user.username}


@router.post("/register", response_model=UserOut)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # check if user already exists
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    # determine role
    total_users = db.query(User).count()
    role = "admin" if total_users == 0 else "user"

    user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(User).all()

@router.put("/users/role")
def update_role(req: RoleUpdateRequest, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = req.role
    db.commit()
    db.refresh(user)
    return {"msg": f"{user.username} role updated to {user.role}"}