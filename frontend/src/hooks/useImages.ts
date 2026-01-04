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
            setImages(data);
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
