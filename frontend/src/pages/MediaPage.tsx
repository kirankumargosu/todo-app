import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  //Grid,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import FolderIcon from "@mui/icons-material/Folder";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

type MediaItem = {
  id: number;
  name: string;
  type: "folder" | "image" | "video";
  thumbnailUrl?: string;
};

export default function MediaPage() {
  // 🔹 Temporary mock data (replace with API later)
  const items: MediaItem[] = [
    { id: 1, name: "Family", type: "folder" },
    { id: 2, name: "Vacation", type: "folder" },
    {
      id: 3,
      name: "Beach.jpg",
      type: "image",
      thumbnailUrl: "https://via.placeholder.com/300",
    },
    {
      id: 4,
      name: "Birthday.mp4",
      type: "video",
      thumbnailUrl: "https://via.placeholder.com/300",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Media Library
      </Typography>

      <Grid container spacing={2}>
        {items.map(item => (
            <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card
              sx={{
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <CardActionArea onClick={() => console.log("Open", item)}>
                {item.type === "folder" ? (
                  <Box
                    sx={{
                      height: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 60, color: "#757575" }} />
                  </Box>
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.thumbnailUrl}
                      alt={item.name}
                    />
                    {item.type === "video" && (
                      <PlayCircleOutlineIcon
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontSize: 48,
                          color: "rgba(255,255,255,0.9)",
                        }}
                      />
                    )}
                  </Box>
                )}

                <CardContent sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    title={item.name}
                    sx={{ textAlign: "center" }}
                  >
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
