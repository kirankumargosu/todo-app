from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class ImageFolder(Base):
    __tablename__ = "image_folders"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True, nullable=False)

    last_policed_at = Column(DateTime)  # when police last scanned folder
    last_reported_at = Column(DateTime)  # when dataset was reported to FastAPI

    image_count = Column(Integer)  # optional: quick stats
    checksum = Column(String)      # optional: folder checksum for changes
