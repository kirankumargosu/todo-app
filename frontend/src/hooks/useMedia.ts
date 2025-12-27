import { useEffect, useState, useCallback } from "react";
import { MEDIA_API_URL } from "../api/config";

export type MediaItem = {
  name: string;
  type: "folder" | "image" | "video";
};

export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [path, setPath] = useState<string>(""); // relative path
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load media items for a given path
   * Uses /media/browse (NOT /media/stream)
   */
  const load = useCallback(async (newPath: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const query = newPath
        ? `?path=${encodeURIComponent(newPath)}`
        : "";

      const res = await fetch(`${MEDIA_API_URL}/browse${query}`);

      if (!res.ok) {
        throw new Error("Failed to load media");
      }

      const data: MediaItem[] = await res.json();
      setItems(data);
      setPath(newPath);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load → root of media directory
   */
  useEffect(() => {
    load("");
  }, [load]);

  return {
    items,
    path,
    loading,
    error,
    navigate: load, // semantic alias
    reload: () => load(path),
  };
}
