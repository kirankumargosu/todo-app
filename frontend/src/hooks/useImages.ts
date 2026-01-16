import { useState, useEffect } from "react";
import { Image, DuplicateGroup } from "../types/image";

import { CLEANSE_API_URL } from "../api/config"

export function useAllImages(token: string) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await fetch(`${CLEANSE_API_URL}/images`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            // console.log("API Response in useAllImages:", data);
            const imageArray = data.images || [];
            const mappedData = imageArray.map((img: any) => ({
                id: img.id,
                path: img.path,
                folder_id: 0, // Default or derived value
                width: 0, // Default or derived value
                height: 0, // Default or derived value
                file_size: 0, // Default or derived value
                analysis: {
                    phash: img.hash || "",
                    has_face: img.has_face,
                    blur_score: img.blur_score,
                    checksum: "", // Default or derived value
                    orientation: 0, // Default or derived value
                    tags: [], // Default or derived value
                    duplicates: [], // Default or derived value
                },
            }));
            // console.log("Mapped Data:", mappedData); // Debugging mapped data
            setImages(mappedData);
            setLoading(false);
        }
        fetchData();
    }, [token]);

    return { images, loading };
}

export function useNoFaceImages(token: string) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await fetch(`${CLEANSE_API_URL}/images/no-face`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setImages(data);
            setLoading(false);
        }
        fetchData();
    }, [token]);

    return { images, loading };
}

export function useBlurredImages(token: string) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await fetch(`${CLEANSE_API_URL}/images/blurred`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setImages(data);
            setLoading(false);
        }
        fetchData();
    }, [token]);

    return { images, loading };
}

export function useDuplicates(token: string, imageId?: number) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!imageId) return;
        async function fetchData() {
            setLoading(true);
            const res = await fetch(`${CLEANSE_API_URL}/images/${imageId}/duplicates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data: DuplicateGroup = await res.json();
            setImages(data.images);
            setLoading(false);
        }
        fetchData();
    }, [token, imageId]);

    return { images, loading };
}
