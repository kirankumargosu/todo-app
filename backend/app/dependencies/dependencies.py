from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user_model import User
from app.security.auth import decode_access_token
from jose import jwt
import logging
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")




def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    """
    Docstring for get_current_user
    
    :param token: Description
    :type token: str
    :param db: Description
    :type db: Session
    :return: Description
    :rtype: User
    # Extracts user information from the JWT token and retrieves the corresponding User from the database.
    """
    # logger.info(f"Decoding token: {token}")
    payload = decode_access_token(token)
    # logger.info(f"Token {token} payload: {payload}")

    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired token")

    # logger.debug(f"Payload extracted: {payload}")
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token payload1")


    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.info(f"User not found for username: {username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found")
    return user

def require_admin(current_user : User = Depends(get_current_user)) -> User:
    """
    Docstring for require_admin
    
    :param current_user: Description
    :type current_user: User
    :return: Description
    :rtype: User
    # Ensures that the current user has admin privileges.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Admin privileges required")
    
    return current_user