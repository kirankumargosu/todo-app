import React from "react";
import { Image } from "../types/image";
import { imageCard } from "../styles/cleanseDashboardStyles";
import { MEDIA_MOUNT_URL } from "../api/config"

interface Props {
    image: Image;
    onClick?: (image: Image) => void;
}

export function ImageCard({ image, onClick }: Props) {
    const imageUrl = `${MEDIA_MOUNT_URL}${encodeURIComponent(image.path.replace(/^media\//, ""))}`;
    // console.log("Constructed Image URL:", imageUrl);

    return (
        <div
            style={imageCard.container}
            onClick={() => onClick?.(image)}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
            <img src={imageUrl}
                alt={image.path}
                style={imageCard.img} />
            <div style={imageCard.meta}>
                {image.analysis.has_face ? (
                    <span style={{ color: "#000" }}>👤</span> // Colored face icon
                ) : (
                    <span style={{ filter: "grayscale(100%)" }}>👤</span> // Black-and-white face icon
                )}
                {image.analysis.blur_score < 100 ? "⚠️ Blurry" : ""}
            </div>
        </div>
    );
}
