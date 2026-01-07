# main.py
import os
import time
from app.police import police_patrol
import requests
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)
logging.getLogger("uvicorn").setLevel(logging.INFO)

# CLEANSE_API_URL = os.getenv('CLEANSE_API_URL', 'http://localhost:8000/') + '/cleanse/image-dataset'

# def trigger_cleanser():
#     """
#     Trigger the cleanser API to remove duplicates or unwanted images.
#     """
#     try:
#         resp = requests.post(CLEANSE_API_URL)
#         if resp.status_code == 200:
#             logger.info("Cleanser: Successfully triggered.")
#         else:
#             logger.info(f"Cleanser: Failed with status {resp.status_code}.")
#     except Exception as e:
#         logger.info(f"Cleanser: Exception occurred - {e}")

def main(poll_interval=60):
    """
    Main loop to patrol media folder, detect duplicates, and trigger cleanser.
    """
    while True:
        logger.info("Main: Running police patrol...")
        police_patrol()
        
        # logger.info("Main: Triggering cleanser...")
        # trigger_cleanser()
        
        logger.info(f"Main: Sleeping for {poll_interval} seconds before next patrol...")
        time.sleep(poll_interval)

if __name__ == "__main__":
    main()
