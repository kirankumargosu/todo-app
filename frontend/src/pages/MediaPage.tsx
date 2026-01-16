import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
  Breadcrumbs,
  Link,
} from "@mui/material";
// import Grid from "@mui/material/Grid";
import FolderIcon from "@mui/icons-material/Folder";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useMedia } from "../hooks/useMedia";
import { MEDIA_API_URL } from "../api/config";

type Props = {
  token: string | null;
  role: string | null;
};

export default function MediaPage({ token, role }: Props) {
  const { items, path, loading, error, navigate } = useMedia();
  const pathParts = path ? path.split("/").filter(Boolean) : [];
  const theme = useTheme();

  const openItem = (item: any) => {
    if (item.type === "folder") {
      navigate(path ? `${path}/${item.name}` : item.name);
    } else if (item.type === "video") {
      window.open(
        `${MEDIA_API_URL}/stream?path=${encodeURIComponent(
          path ? `${path}/${item.name}` : item.name
        )}`,
        "_blank"
      );
    }
  };

  const navigateTo = (index: number) => {
    const newPath = pathParts.slice(0, index + 1).join("/");
    navigate(newPath);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("")}
        >
          Media Library
        </Link>

        {pathParts.map((part, index) => (
          <Link
            key={index}
            underline="hover"
            color={index === pathParts.length - 1 ? "text.primary" : "inherit"}
            sx={{ cursor: "pointer" }}
            onClick={() => navigateTo(index)}
          >
            {part}
          </Link>
        ))}
      </Breadcrumbs>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.name} size={{xs: 6, sm: 4, md: 3}}>
            <Card
              sx={{
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardActionArea onClick={() => openItem(item)}>
                {item.type === "folder" ? (
                  <Box
                    sx={{
                      height: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 60 }} />
                  </Box>
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component={item.type === "video" ? "video" : "img"}
                      height="140"
                      src={
                        item.type === "image" ? item.thumbnailUrl : `${MEDIA_API_URL}/stream?path=${encodeURIComponent(
                          path ? `${path}/${item.name}` : item.name
                        )}`
                      }
                      preload={item.type === "video" ? "metadata" : undefined}
                      controls={item.type === "video"}
                      loading={item.type === "image" ? "lazy" : undefined}
                    />
                    {item.type === "video" && (
                      <PlayCircleOutlineIcon
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontSize: 48,
                          color: "rgba(255,255,255,0.8)",
                        }}
                      />
                    )}
                  </Box>
                )}
                <CardContent sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    align="center"
                    color="text.primary"
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
