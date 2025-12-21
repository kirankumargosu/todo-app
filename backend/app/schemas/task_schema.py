from pydantic import BaseModel
# from app.database import SessionLocal

class TaskBase(BaseModel):
    title: str
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    class Config:
        # orm_mode = True
        from_attributes = True

# def get_db_task():
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()