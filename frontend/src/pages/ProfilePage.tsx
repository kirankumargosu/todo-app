// ProfilePage.tsx
import { Typography, Container } from "@mui/material";

export default function ProfilePage() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" mb={2}>
        Profile
      </Typography>
      <Typography variant="body1">
        This page is currently empty. You can add profile details here later.
      </Typography>
    </Container>
  );
}
