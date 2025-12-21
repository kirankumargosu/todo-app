from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os
import logging
logger = logging.getLogger(__name__)

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
    logger.debug(f"Decoding token in auth.py: {token} using SECRET_KEY: {SECRET_KEY} and ALGORITHM: {ALGORITHM}")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
    