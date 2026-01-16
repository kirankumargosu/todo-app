import React, { useState } from "react";
import { useAllImages, useNoFaceImages, useBlurredImages, useDuplicates } from "../hooks/useImages";
import { ImageGrid } from "../components/ImageGrid";
import { Image } from "../types/image";
import { MEDIA_API_URL } from "../api/config";
import { tabs, imageGrid, imageCard } from "../styles/cleanseDashboardStyles";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    CircularProgress,
    Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ImageCard } from "../components/ImageCard";

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

    let imagesToShow = Array.isArray(allImages) ? allImages : [];
    let loading = loadingAll;

    if (activeTab === "noFace") {
        imagesToShow = Array.isArray(noFaceImages) ? noFaceImages : [];
        loading = loadingNoFace;
    } else if (activeTab === "blurred") {
        imagesToShow = Array.isArray(blurredImages) ? blurredImages : [];
        loading = loadingBlurred;
    } else if (activeTab === "duplicates") {
        imagesToShow = Array.isArray(duplicateImages) ? duplicateImages : [];
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

    // console.log("Active Tab:", activeTab);
    // console.log("Images to Show:", imagesToShow);
    // console.log("Loading State:", loading);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Cleanse Dashboard
            </Typography>

            <div style={tabs.container}>
                {renderTabButton("All Images", "all")}
                {renderTabButton("Duplicates", "duplicates", !selectedImage)}
                {renderTabButton("No-Face Images", "noFace")}
                {renderTabButton("Blurred Images", "blurred")}
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <Grid container spacing={2}>
                    {imagesToShow.map((image) => (
                        <Grid key={image.id} size={{ xs: 6, sm: 4, md: 3 }}>
                            <ImageCard image={image} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

<Card
    sx={{
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
    }}
></Card>
