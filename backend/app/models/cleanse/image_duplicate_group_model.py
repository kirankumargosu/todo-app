from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class ImageDuplicateGroup(Base):
    __tablename__ = "image_duplicate_groups"

    group_id = Column(Integer, primary_key=True)
    image_id = Column(
        Integer,
        ForeignKey("images.id", ondelete="CASCADE"),
        primary_key=True
    )

    is_primary = Column(Integer)   # 1 = best image
    hash_distance = Column(Integer)
    image = relationship("Image", back_populates="duplicates")

    