import { useEffect, useState, useCallback } from "react";
import { MEDIA_API_URL } from "../api/config";

export type MediaItem = {
  name: string;
  type: "folder" | "image" | "video";
  thumbnailUrl?: string; // optional for images
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

      // For images, set thumbnail URL instead of full stream URL
      const itemsWithThumbs = data.map(item => {
        if (item.type === "image") {
          return {
            ...item,
            thumbnailUrl: `${MEDIA_API_URL}/thumbnail?path=${encodeURIComponent(
              newPath ? `${newPath}/${item.name}` : item.name
            )}`,
          };
        }
        return item;
      });

      setItems(itemsWithThumbs);
      setPath(newPath);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  return {
    items,
    path,
    loading,
    error,
    navigate: load,
    reload: () => load(path),
  };
}
