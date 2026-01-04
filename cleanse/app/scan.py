# scan.py
import cv2
import imagehash
from PIL import Image
# import face_recognition
import os

BLUR_THRESHOLD = os.getenv('BLUR_THRESHOLD', 100.0)

def scan_image(file_path: str) -> dict:
    """
    Scan an image and return its features:
    - hash
    - blur_score
    - has_face
    """
    # Hash
    img = Image.open(file_path)
    hash_val = str(imagehash.phash(img))

    # Blur detection
    cv_img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    blur_score = cv2.Laplacian(cv_img, cv2.CV_64F).var()

    # Face detection
    # faces = face_recognition.load_image_file(file_path)
    # face_locations = face_recognition.face_locations(faces)
    # has_face = len(face_locations) > 0
    has_face = False

    return {
        "hash": hash_val,
        "blur_score": blur_score,
        "has_face": has_face,
    }
