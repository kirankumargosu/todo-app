from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    link_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    # new column with foreign key
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # relationship
    assigned_user = relationship("User", back_populates="tasks")

    def to_string(self):
        return {'id' : self.id, 
                'title': self.title,
                'link_url': self.link_url,
                'notes': self.notes,
                'completed': self.completed,
                'assigned_user_id': self.assigned_user_id
                  }