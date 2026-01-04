# detective.py
import requests
from typing import List
import os

import logging
logger = logging.getLogger(__name__)

FASTAPI_URL = "http://localhost:8000"
CLEANSE_API_URL = os.getenv('CLEANSE_API_URL', 'http://localhost:8000/') + '/cleanse/image-dataset'
API_URL = "http://localhost:8000/cleanse/images/report"  # FastAPI endpoint for reporting


def detective_run(new_image_paths: List[str] = None):
    """
    Detect duplicates using FastAPI data.
    - new_image_paths: optional, only check these images; else check all
    """
    # 1. Fetch images from FastAPI    
    params = {"paths": ",".join(new_image_paths)} if new_image_paths else {}
    logger.info(f"Fetching image via fastapi using {params}")
    resp = requests.get(f"{FASTAPI_URL}/cleanse/images/metadata", params=params)
    resp.raise_for_status()
    images = resp.json()["images"]  # [{id, path, hash, blur_score, has_face}, ...]

    # 2. Group images by hash
    logger.info(f"Grouping images using hash")
    hash_groups = {}
    for img in images:
        hash_groups.setdefault(img["hash"], []).append(img)

    # 3. Prepare duplicate groups
    logger.info(f"Preparing duplicates")
    duplicate_groups = []
    for hash_val, group_images in hash_groups.items():
        if len(group_images) < 2:
            continue  # no duplicates

        # Sort by blur_score descending (least blurry = master)
        group_images.sort(key=lambda x: (
                            (x.get("width", 0) or 0) * (x.get("height", 0) or 0),
                            x.get("blur_score", 0)
                            ),
                            reverse=True
                         )
        group_images.sort(key=lambda x: x["blur_score"], reverse=True)
        master_image_id = group_images[0]["id"]

        for img in group_images:
            duplicate_groups.append({
                "group_id": hash_val,  # can use hash as group_id
                "image_id": img["id"],
                "is_primary": master_image_id
            })

    # 4. Send results to FastAPI
    logger.info(f"Sending results to fastapi")
    resp = requests.post(f"{FASTAPI_URL}/cleanse/images/duplicates", json = duplicate_groups)
    if resp.status_code == 200:
        logger.info(f"Detective: {len(duplicate_groups)} duplicates reported to FastAPI.")
    else:
        logger.info("Detective: Failed to report duplicates.")
