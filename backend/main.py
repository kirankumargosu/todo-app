from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import argparse
import uvicorn
from app.models import User
# models.Base.metadata.create_all(bind=engine)
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)
logging.getLogger("uvicorn").setLevel(logging.INFO)

from app.routes import task_router
from app.routes import auth_router

app = FastAPI()
# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

app.include_router(auth_router)
app.include_router(task_router)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the API server")
    parser.add_argument("--init-db", action="store_true", help="Initialize DB tables before starting the server")
    parser.add_argument("--init-db-only", action="store_true", help="Run DB autoupgrade and exit (do not start server)")
    args = parser.parse_args()

    if args.init_db_only:
        logger.info("--init-db-only specified: attempting autoupgrade (non-destructive) and exiting")
        try:
            from app.utils import init_db
            init_db.autoupgrade()
            logger.info("Autoupgrade completed; exiting as requested (init-db-only)")
            raise SystemExit(0)
        except Exception:
            logger.exception("Failed to initialize / autoupgrade database tables")
            raise SystemExit(1)

    if args.init_db:
        logger.info("--init-db specified: attempting autoupgrade (non-destructive) before starting the server")
        try:
            from app.utils import init_db
            init_db.autoupgrade()
        except Exception:
            logger.exception("Failed to initialize / autoupgrade database tables")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

