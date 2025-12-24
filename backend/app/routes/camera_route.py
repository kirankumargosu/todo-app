import os
import time
from fastapi import APIRouter, HTTPException, Path, Depends
from fastapi.responses import FileResponse
from app.home.camera_stream import CameraStream
from app.dependencies.dependencies import require_admin

import logging
logger = logging.getLogger(__name__)

camera_router = APIRouter(prefix="/camera", tags=["camera"])

BASE_HLS_DIR = "./hls"

# Camera configuration
camera_configs = {
    "camera1": {
        "rtsp_url": os.getenv("CAMERA1"),
        "hls_dir": f"{BASE_HLS_DIR}/camera1",
    },
    "camera2": {
        "rtsp_url": os.getenv("CAMERA2"),
        "hls_dir": f"{BASE_HLS_DIR}/camera2",
    },
}

# Create CameraStream instances
camera_streams: dict[str, CameraStream] = {}

for camera_name, cfg in camera_configs.items():
    if not cfg["rtsp_url"]:
        raise RuntimeError(f"RTSP URL not set for {camera_name}")

    camera_streams[camera_name] = CameraStream(
        name=camera_name,
        rtsp_url=cfg["rtsp_url"],
        hls_dir=cfg["hls_dir"],
    )

@camera_router.get("/{camera_name}/feed", dependencies=[Depends(require_admin)])
def get_playlist(camera_name: str):
    """
    Returns the HLS playlist (stream.m3u8)
    """
    if camera_name not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")

    stream = camera_streams[camera_name]

    # Start FFmpeg lazily
    stream.start()
    time.sleep(3)

    playlist_path = os.path.join(stream.hls_dir, "stream.m3u8")
    if not os.path.exists(playlist_path):
        raise HTTPException(status_code=503, detail="Stream not ready")

    return FileResponse(
        playlist_path,
        media_type="application/vnd.apple.mpegurl",
    )


@camera_router.get("/{camera_name}/hls/{segment_name}", dependencies=[Depends(require_admin)])
def get_segment(
    camera_name: str,
    segment_name: str = Path(...),
):
    """
    Returns individual .ts segments
    """
    if camera_name not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")

    segment_path = os.path.join(
        camera_streams[camera_name].hls_dir,
        segment_name,
    )

    if not os.path.exists(segment_path):
        raise HTTPException(status_code=404, detail="Segment not found")

    return FileResponse(
        segment_path,
        media_type="video/MP2T",
    )