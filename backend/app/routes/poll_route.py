
from fastapi import APIRouter, Depends, HTTPException
# from app.models import Task
from app.models import Poll
from typing import List
# from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.poll_schema import PollCreate, PollUpdate, PollResponse
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db

from app.dependencies.dependencies import require_admin
import logging
logger = logging.getLogger(__name__)

poll_router = APIRouter(prefix="/poll", tags=["poll"])

@poll_router.get("/polls", response_model=List[PollResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Poll).options(joinedload(Poll.created_user)).all()