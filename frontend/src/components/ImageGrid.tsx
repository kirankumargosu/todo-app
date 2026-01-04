import React from "react";
import { Image } from "../types/image";
import { ImageCard } from "./ImageCard";
import { imageGrid } from "../styles/cleanseDashboardStyles";

interface Props {
    images: Image[];
    onImageClick?: (image: Image) => void;
}

export function ImageGrid({ images, onImageClick }: Props) {
    return (
        <div style={imageGrid}>
            {images && images.length > 0 ? (
            images.map(img => <ImageCard key={img.id} image={img} onClick={onImageClick} />)
            ) : (
            <div>No images found</div>
            )}
        </div>
    );
}
