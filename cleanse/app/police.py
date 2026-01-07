import os
import requests
from app.scan import scan_image
from typing import List
from app.detective import detective_run
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

CLEANSE_API_URL = os.getenv('CLEANSE_API_URL', 'http://localhost:8000/') + '/cleanse/image-dataset'
API_URL = "http://localhost:8000/cleanse/images/report"  # FastAPI endpoint for reporting

MEDIA_FOLDER = os.getenv('MEDIA_MOUNT', '../mnt/media/shared/photos')
MEDIA_FOLDER = '../mnt'
IGNORE_FOLDERS = os.getenv('CLEANSE_IGNORE_FOLDERS', '.thumbnails,ignore_dir')
IGNORE_FILES = os.getenv('CLEANSE_IGNORE_FILES', '.DS_Store,ignore_file')
def police_patrol():
    """
    Patrol all folders in MEDIA_FOLDER, scan new images, and report features.
    """
    new_images = []
    folders_to_ignore = IGNORE_FOLDERS.split(',')
    files_to_ignore = IGNORE_FILES.split(',')
    logger.info(f"Police patrolling {MEDIA_FOLDER}")
    for root, _, files in os.walk(MEDIA_FOLDER):
        if os.path.isdir(root):
            if root.split('/')[-1] in folders_to_ignore:
                logger.info(f"Ignored directory {root}")
                continue
        
        logger.info(f"Checking files {files}")
        for file in files: 
            logger.info(f"Checking file {file}")
            if os.path.isfile(os.path.join(root, file)):
                logger.info(f"{file} is a file")
                if file.split('/')[-1] in files_to_ignore:
                    logger.info(f"Ignored file {file}")
                    continue

            if file.lower().endswith((".jpg", ".png", ".jpeg")) and not file.startswith("._"):
                file_path = os.path.join(root, file)
                # logger.info(f"file path is {file_path}")
                image_data = scan_image(file_path)  # returns dict with hash, blur_score, has_face
                image_data["path"] = os.path.relpath(file_path, MEDIA_FOLDER)
                new_images.append(image_data)

    if new_images:
        logger.info(f"Police: Found {len(new_images)} new images. Reporting to FastAPI with {new_images}")        
        response = requests.post(API_URL, json = new_images)
        if response.status_code == 200:
            logger.info("Police: Reported successfully.")
            # Trigger detective for new images
            trigger_detective([img["path"] for img in new_images])
        else:
            logger.info("Police: Failed to report images.")
    else:
        logger.info("Police: No new media found.")

def trigger_detective(new_image_paths: List[str]):
    """
    Trigger the detective service for duplicate detection.
    """
    logger.info("Police: Triggering Detective...")
    detective_run(new_image_paths)
