from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class ImageAnalysis(Base):
    __tablename__ = "image_analysis"

    image_id = Column(
        Integer,
        ForeignKey("images.id", ondelete="CASCADE"),
        primary_key=True
    )

    phash = Column(String, index=True)
    has_face = Column(Integer)     # 1 = yes, 0 = no, NULL = not analyzed
    is_blurry = Column(Integer)    # 1 = yes, 0 = no, NULL = not analyzed
    blur_score = Column(Float)
    analyzed_at = Column(DateTime, server_default=func.now())
