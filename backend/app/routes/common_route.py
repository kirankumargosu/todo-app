
from fastapi import APIRouter
from fastapi.security import OAuth2PasswordBearer
import os
import logging
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

common_router = APIRouter(prefix="/common", tags=["common"])

@common_router.get("/appdetails")
def get_common_app_details_versions():
    return {
        'ui_version': os.getenv('UI_VERSION', '0.0.0') + '.u',
        'backend_version' : os.getenv('BACKEND_VERSION', '0.0.0') + '.b',
        'app_version' : os.getenv('APP_VERSION', '0.0.0') + '.a',
        'app_name' : os.getenv('APP_NAME', 'Todo App')
    }
