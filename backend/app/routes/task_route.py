from fastapi import APIRouter, Depends, HTTPException
from app.models import Task
from typing import List
from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db

from app.dependencies.dependencies import require_admin, get_current_user
import logging
logger = logging.getLogger(__name__)

task_router = APIRouter(prefix="/task", tags=["task"])

@task_router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).options(joinedload(Task.assigned_user)).all()
    logger.debug(tasks)
    return [
        TaskResponse(
            id=task.id,
            title=task.title,
            completed=task.completed,
            link_url=task.link_url,
            notes=task.notes,
            task_notes=task.task_notes,
            assigned_user_id=task.assigned_user_id,
            assigned_user=task.assigned_user,
            last_updated_at=task.last_updated_at.isoformat() if task.last_updated_at else "",
            last_updated_by=task.last_updated_by
        )
        for task in tasks
    ]

@task_router.post("/tasks", response_model=TaskResponse, dependencies=[Depends(require_admin)])
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    logger.debug(task.to_string())
    db_task = Task(
        title=task.title,
        completed=False,
        link_url=task.link_url,
        notes=task.notes,
        task_notes=task.task_notes,
        assigned_user_id=task.assigned_user_id,
        last_updated_by=current_user.username if hasattr(current_user, 'username') else current_user.get("username")
    )
    logger.debug(db_task.to_string())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        completed=db_task.completed,
        link_url=db_task.link_url,
        notes=db_task.notes,
        task_notes=db_task.task_notes,
        assigned_user_id=db_task.assigned_user_id,
        assigned_user=db_task.assigned_user,
        last_updated_at=db_task.last_updated_at.isoformat() if db_task.last_updated_at else "",
        last_updated_by=db_task.last_updated_by
    )

@task_router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.title = task.title
    db_task.completed = task.completed
    db_task.link_url = task.link_url
    db_task.notes = task.notes
    db_task.task_notes = task.task_notes
    db_task.assigned_user_id = task.assigned_user_id
    db_task.last_updated_by = current_user.username if hasattr(current_user, 'username') else current_user.get("username")
    db.commit()
    db.refresh(db_task)
    return TaskResponse(
        id=db_task.id,
        title=db_task.title,
        completed=db_task.completed,
        link_url=db_task.link_url,
        notes=db_task.notes,
        task_notes=db_task.task_notes,
        assigned_user_id=db_task.assigned_user_id,
        assigned_user=db_task.assigned_user,
        last_updated_at=db_task.last_updated_at.isoformat() if db_task.last_updated_at else None,
        last_updated_by=db_task.last_updated_by
    )

@task_router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}