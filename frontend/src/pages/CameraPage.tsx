import { useState, useRef } from "react";
import CameraPlayer from "../components/CameraPlayer";
import { CAMERA_API_URL } from "../api/config";
const cameras = [
  {
    id: "camera1",
    name: "Kitchen Door",
    feed: `${CAMERA_API_URL}/camera1/feed`,
  },
  {
    id: "camera2",
    name: "Front Door",
    feed: `${CAMERA_API_URL}/camera2/feed`,
  },
];
type CameraPageProps = {
  token: string | null;
  role: string | null;
};

const SWIPE_THRESHOLD = 50;
export default function CameraPage({ token, role }: CameraPageProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goNext = () => {
    setIndex((prev) => (prev + 1) % cameras.length);
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + cameras.length) % cameras.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goNext() : goPrev();
    }

    touchStartX.current = null;
  };

  // Mouse handlers (for laptop)
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#000",
      }}
    >
      {/* Title */}
      <div
        style={{
          color: "white",
          textAlign: "center",
          padding: "8px",
          fontSize: "16px",
        }}
      >
        {cameras[index].name}
      </div>

      {/* Video */}
      <div style={{ flex: 1 }}>
        <CameraPlayer
          key={cameras[index].id}
          feedUrl={cameras[index].feed}
          token={token!}
        />
      </div>
      {/* Buttons for desktop testing */}
      <div style={{ textAlign: "center", padding: "8px" }}>
        <button onClick={goPrev}>◀ Camera</button>
        <button onClick={goNext} style={{ marginLeft: "8px" }}>
          Camera ▶
        </button>
      </div>
      {/* Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "8px",
          gap: "8px",
        }}
      >
        {cameras.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === index ? "white" : "gray",
            }}
          />
        ))}
      </div>
    </div>
  );
};

