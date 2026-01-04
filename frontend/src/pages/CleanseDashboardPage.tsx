import React, { useState } from "react";
import { useAllImages, useNoFaceImages, useBlurredImages, useDuplicates } from "../hooks/useImages";
import { ImageGrid } from "../components/ImageGrid";
import { Image } from "../types/image";
import { tabs, imageGrid, imageCard } from "../styles/cleanseDashboardStyles";

interface Props {
  token: string;
  role: string | null;
}

export default function CleanseDashboardPage({ token, role }: Props) {
    const [activeTab, setActiveTab] = useState<"all" | "duplicates" | "noFace" | "blurred">("all");
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);

    const { images: allImages, loading: loadingAll } = useAllImages(token);
    const { images: noFaceImages, loading: loadingNoFace } = useNoFaceImages(token);
    const { images: blurredImages, loading: loadingBlurred } = useBlurredImages(token);
    const { images: duplicateImages, loading: loadingDuplicates } = useDuplicates(token, selectedImage?.id);

    let imagesToShow = allImages;
    let loading = loadingAll;

    if (activeTab === "noFace") {
        imagesToShow = noFaceImages;
        loading = loadingNoFace;
    } else if (activeTab === "blurred") {
        imagesToShow = blurredImages;
        loading = loadingBlurred;
    } else if (activeTab === "duplicates") {
        imagesToShow = duplicateImages;
        loading = loadingDuplicates;
    }

    const handleImageClick = (image: Image) => {
        setSelectedImage(image);
        setActiveTab("duplicates");
    };

    const renderTabButton = (label: string, tabKey: "all" | "duplicates" | "noFace" | "blurred", disabled = false) => {
        const isActive = activeTab === tabKey;
        return (
            <button
                style={{
                    ...tabs.button,
                    ...(isActive ? tabs.activeButton : {}),
                    ...(disabled ? tabs.disabledButton : {}),
                }}
                onClick={() => setActiveTab(tabKey)}
                disabled={disabled}
            >
                {label}
            </button>
        );
    };

    return (
        <div>
            <h2>Cleanse Dashboard</h2>
            <div style={tabs.container}>
                {renderTabButton("All Images", "all")}
                {renderTabButton("Duplicates", "duplicates", !selectedImage)}
                {renderTabButton("No-Face Images", "noFace")}
                {renderTabButton("Blurred Images", "blurred")}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div style={imageGrid}>
                    <ImageGrid images={imagesToShow} onImageClick={handleImageClick} />
                </div>
            )}
        </div>
    );
}
