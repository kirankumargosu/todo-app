from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

from sqlalchemy.sql import func
from app.db.database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True)
    hash = Column(String, index=True)
    blur_score = Column(Float, nullable=True)  # new column
    has_face = Column(Boolean, default=True)   # new column

    duplicates = relationship("ImageDuplicateGroup", back_populates="image", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "path": self.path,
            "hash": self.hash,
            "blur_score": self.blur_score,
            "has_face": self.has_face
        }
    