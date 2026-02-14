from pydantic import BaseModel
from typing import Optional

class TaskBase(BaseModel):
    title: str
    completed: bool = False
    link_url: Optional[str] = None
    notes: Optional[str] = None
    task_notes: Optional[str] = None
    assigned_user_id: Optional[int] = None

    def to_string(self):
        return {'title': self.title,
                'link_url': self.link_url,
                'notes': self.notes,
                'completed': self.completed,
                'assigned_user_id': self.assigned_user_id
                  }

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskOut(BaseModel):
    id: int
    title: str
    link_url: Optional[str] = None
    notes: Optional[str] = None
    task_notes: Optional[str] = None
    completed: bool
    assigned_user_id: Optional[int] = None

    def to_string(self):
        return super().to_string()

    class Config:
        from_attributes = True

class AssignedUserOut(BaseModel):
    id: int
    username: str

    def to_string(self):
        return super().to_string()
    
    class Config:
        from_attributes = True

class TaskResponse(TaskBase):
    id: int
    assigned_user: Optional[AssignedUserOut] = None
    last_updated_at: str  # ISO format

    def to_string(self):
        return {'title': self.title,
                'link_url': self.link_url,
                'notes': self.notes,
                'task_notes': self.task_notes,
                'completed': self.completed,
                'assigned_user_id': self.assigned_user_id,
                'last_updated_at': self.last_updated_at
                  }
    
    class Config:
        from_attributes = True

