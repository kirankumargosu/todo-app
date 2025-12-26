from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_active = Column(Boolean, default=False)
    # assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # relationship
    # assigned_user = relationship("User", back_populates="tasks")
    created_user = relationship("User", back_populates="polls")


    def to_string(self):
        return {'id' : self.id, 
                'title': self.title,
                'is_active': self.is_active,
                'created_user_id': self.created_user_id
                  }