import os
import subprocess
from threading import Lock

class CameraStream:
    def __init__(self, name: str, rtsp_url: str, hls_dir: str):
        self.name = name
        self.rtsp_url = rtsp_url
        self.hls_dir = hls_dir
        self.process = None
        self.lock = Lock()

        os.makedirs(self.hls_dir, exist_ok=True)

    def start(self):
        with self.lock:
            if self.process and self.process.poll() is None:
                return  # already running

            playlist_path = os.path.join(self.hls_dir, "stream.m3u8")

            cmd = [
                "ffmpeg",
                "-rtsp_transport", "tcp",
                "-i", self.rtsp_url,
                "-fflags", "nobuffer",
                "-flags", "low_delay",
                "-an",
                "-c:v", "copy",
                "-f", "hls",
                "-hls_time", "2",
                "-hls_list_size", "5",
                "-hls_flags", "delete_segments+append_list",
                "-hls_base_url", f"/camera/{self.name}/hls/",
                playlist_path,
            ]

            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

    def stop(self):
        with self.lock:
            if self.process:
                self.process.terminate()
                self.process = None
