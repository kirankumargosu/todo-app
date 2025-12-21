
from fastapi import APIRouter, Depends, status, HTTPException
from app.models import User, Task
from typing import List
from app.schemas.user_schema import LoginRequest, RegisterRequest, UserOut, RoleUpdateRequest
from app.db.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.security.auth import verify_password, create_access_token, hash_password, decode_access_token
from fastapi.security import OAuth2PasswordBearer
import logging
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login/")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    print("Login attempt for user:", req.username)
    user = db.query(User).filter(func.lower(User.username) == req.username.lower()).first()
    logger.info(f"User fetched from DB: {user}")
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "role": user.role, "username": user.username}


@auth_router.post("/register", response_model=UserOut)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # check if user already exists (case-insensitive)
    if db.query(User).filter(func.lower(User.username) == req.username.lower()).first():
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

@auth_router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        if payload["role"] != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
        return db.query(User).all()
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

@auth_router.put("/users/role")  
def update_role(req: RoleUpdateRequest, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    user = db.query(User).filter(func.lower(User.username) == req.username.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = req.role
    db.commit()
    db.refresh(user)
    return {"msg": f"{user.username} role updated to {user.role}"}