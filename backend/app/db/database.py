from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from logging import getLogger
logger = getLogger(__name__)
9+
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

logger.info(f"Database used is {DATABASE_URL}")
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
