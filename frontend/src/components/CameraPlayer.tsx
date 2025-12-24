import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

interface CameraPlayerProps {
  feedUrl: string;
  token?: string;
  width?: number;
  height?: number;
}

const CameraPlayer: React.FC<CameraPlayerProps> = ({feedUrl = "", token = "", width = 640, height = 480 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          },
        });
        hls.loadSource(feedUrl);
        hls.attachMedia(videoRef.current);
        hls.startLoad();

        return () => {
          hls.destroy();
        };
      } else {
        // fallback for browsers that support HLS natively
        videoRef.current.src = feedUrl;
      }
    }
  }, [feedUrl, token]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      style={{ width, height, border: "1px solid #ccc", borderRadius: "8px" }}
    />
  );
};

export default CameraPlayer;
