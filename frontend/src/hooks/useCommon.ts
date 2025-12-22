import { useState, useEffect } from "react";
import { COMMON_API_URL } from "../api/config";
import type { CommonAppDetails } from "../types/common";

export function useCommonAppDetails() {
    const [version, setVersion] = useState<CommonAppDetails | null>(null);

    useEffect(() => {
        async function loadCommonAppDetails() {
            try {
                const res = await fetch(`${COMMON_API_URL}/appdetails`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: CommonAppDetails = await res.json();
                setVersion(data);
            } catch (err) {
                console.warn("Failed to load version:", err);
                setVersion({ app_version: "", ui_version: "", backend_version: "", app_name: "" }); // fallback
            }
        }
        loadCommonAppDetails();
    }, []);

    return version;
}
