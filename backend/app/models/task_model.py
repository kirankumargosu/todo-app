from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    link_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    task_notes = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # relationship
    assigned_user = relationship("User", back_populates="tasks")

    def to_string(self):
        return {'id' : self.id, 
                'title': self.title,
                'link_url': self.link_url,
                'notes': self.notes,
                'task_notes': self.task_notes,
                'completed': self.completed,
                'assigned_user_id': self.assigned_user_id,
                'last_updated_at': self.last_updated_at
                  }