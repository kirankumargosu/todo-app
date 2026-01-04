export interface ImageAnalysis {
    phash: string;
    has_face: boolean;
    blur_score: number;
    checksum: string;
    orientation: number;
    tags: string[];
    duplicates: number[];
}

export interface Image {
    id: number;
    path: string;
    folder_id: number;
    width: number;
    height: number;
    file_size: number;
    analysis: ImageAnalysis;
}

export interface DuplicateGroup {
    group_id: number;
    images: Image[];
    primary_image_id: number;
}
