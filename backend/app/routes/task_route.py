
from fastapi import APIRouter, Depends, HTTPException
from app.models import Task
from typing import List
from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies.dependencies import require_admin
import logging
logger = logging.getLogger(__name__)

task_router = APIRouter(prefix="/task", tags=["task"])

@task_router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@task_router.post("/tasks", response_model=TaskResponse, dependencies=[Depends(require_admin)])
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(title=task.title, completed=False, link_url=task.link_url, notes=task.notes, assigned_to=task.assigned_to)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@task_router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.title = task.title
    db_task.completed = task.completed
    db_task.link_url = task.link_url
    db_task.notes = task.notes
    db_task.assigned_to = task.assigned_to
    db.commit()
    db.refresh(db_task)
    return db_task

@task_router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}