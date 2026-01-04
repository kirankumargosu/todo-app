from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.db.database import get_db
from app.schemas.cleanse.image_police_schema import ImageDataset, ImageDatasetItem
from app.models.cleanse.image_model import Image
from app.models.cleanse.image_analysis_model import ImageAnalysis
from app.models.cleanse.image_folder_model import ImageFolder
from app.models.cleanse.image_duplicate_group_model import ImageDuplicateGroup

cleanse_router = APIRouter(prefix="/cleanse", tags=["cleanse"])


@cleanse_router.post("/image-dataset")
def report_image_dataset(dataset: ImageDataset, db: Session = Depends(get_db)):
    """
    Receive a folder scan (image-police) and persist all images, analysis, 
    and update folder metadata.
    """

    # 1️⃣ Upsert folder metadata
    folder = db.query(ImageFolder).filter(ImageFolder.path == dataset.folder).first()
    now = datetime.utcnow()

    if not folder:
        folder = ImageFolder(
            path=dataset.folder,
            last_policed_at=now,
            last_reported_at=now,
            image_count=len(dataset.images)
        )
        db.add(folder)
        db.commit()
        db.refresh(folder)
    else:
        folder.last_policed_at = now
        folder.last_reported_at = now
        folder.image_count = len(dataset.images)
        db.commit()

    # 2️⃣ Process each image
    for item in dataset.images:
        # Upsert Image
        image = db.query(Image).filter(Image.path == item.path).first()
        if not image:
            image = Image(
                path=item.path,
                folder_id=folder.id,
                width=item.width,
                height=item.height,
                file_size=item.file_size,
                modified_at=now
            )
            db.add(image)
            db.commit()
            db.refresh(image)
        else:
            # Update metadata if changed
            image.width = item.width
            image.height = item.height
            image.file_size = item.file_size
            db.commit()

        # Upsert ImageAnalysis
        analysis = db.query(ImageAnalysis).filter(ImageAnalysis.image_id == image.id).first()
        if not analysis:
            analysis = ImageAnalysis(
                image_id=image.id,
                phash=item.phash,
                has_face=1 if item.has_face else 0,
                is_blurry=1 if item.blur_score < 100 else 0,  # Phase-1 threshold
                blur_score=item.blur_score,
                analyzed_at=now
            )
            db.add(analysis)
        else:
            # Update if needed
            analysis.phash = item.phash
            analysis.has_face = 1 if item.has_face else 0
            analysis.is_blurry = 1 if item.blur_score < 100 else 0
            analysis.blur_score = item.blur_score
            analysis.analyzed_at = now

    db.commit()

    # 3️⃣ Optionally, trigger duplicate rebuild (global)
    # Can call a helper function here: rebuild_duplicates(db)
    # For Phase-1, duplicates are computed across all images
    # from app.services.duplicates import rebuild_duplicates
    # rebuild_duplicates(db)

    return {"status": "success", "folder": dataset.folder, "images_processed": len(dataset.images)}

@cleanse_router.get("/images/metadata")
def get_image_metadata(paths: Optional[str] = Query(None), db: Session = Depends(get_db)):

    """
    Returns image metadata for all images or filtered by comma-separated paths.
    """
    query = db.query(Image)
    
    if paths:
        path_list = paths.split(",")
        query = query.filter(Image.path.in_(path_list))
    
    images = query.all()
    
    # Convert to dictionary format for detective
    results = [
        {
            "id": img.id,
            "path": img.path,
            "hash": img.hash,
            "blur_score": img.blur_score,
            "has_face": img.has_face,
        }
        for img in images
    ]
    
    return {"images": results}

@cleanse_router.get("/images")
def get_all_images(db: Session = Depends(get_db)):
    images = db.query(Image).all()
    return {"images": [img.to_dict() for img in images]}  # implement to_dict() in model

@cleanse_router.get("/images/no-face")
def get_no_face_images(db: Session = Depends(get_db)):
    images = db.query(Image).filter(Image.has_face == False).all()
    return {"images": [img.to_dict() for img in images]}

@cleanse_router.get("/images/blurred")
def get_blurred_images(db: Session = Depends(get_db)):
    images = db.query(Image).filter(Image.blur_score < 100).all()  # threshold example
    return {"images": [img.to_dict() for img in images]}

@cleanse_router.get("/images/metadata")
def get_image_metadata(paths: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Image)
    if paths:
        path_list = paths.split(",")
        query = query.filter(Image.path.in_(path_list))
    images = query.all()
    return {"images": [img.to_dict() for img in images]}

@cleanse_router.post("/images/report")
def report_images(images: List[dict], db: Session = Depends(get_db)):
    """
    Police reports features: hash, blur_score, has_face
    """    
    for img in images:
        existing = db.query(Image).filter_by(path=img["path"]).first()
        if existing:
            existing.hash = img["hash"]
            existing.blur_score = img["blur_score"]
            existing.has_face = img["has_face"]
        else:
            db.add(Image(
                path=img["path"],
                hash=img["hash"],
                blur_score=img["blur_score"],
                has_face=img["has_face"]
            ))
    db.commit()
    return {"status": "success", "count": len(images)}

@cleanse_router.post("/images/duplicates")
def report_duplicates(groups: List[dict], db: Session = Depends(get_db)):
    """
    Accepts duplicate groups from the detective.
    Each group dict:
    {
        "group_id": int,
        "image_id": int,
        "is_primary": int,      # optional
        "hash_distance": int    # optional
    }
    """
    for g in groups:
        existing = db.query(ImageDuplicateGroup).filter_by(
            group_id=g["group_id"], image_id=g["image_id"]
        ).first()
        if not existing:
            db.add(ImageDuplicateGroup(
                group_id=g["group_id"],
                image_id=g["image_id"],
                is_primary=g.get("is_primary", 0),
                hash_distance=g.get("hash_distance", 0)
            ))
    db.commit()
    return {"status": "success", "count": len(groups)}