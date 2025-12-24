import React, { useState } from "react";
import {
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";

type LoginPageProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
};

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"login" | "register" | null>(null);

  const isDisabled = username.trim() === "" || password.trim() === "";

  const handleLogin = async () => {
    setError(null);
    setLoadingAction("login");
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setLoadingAction("register");
    try {
      await onRegister(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={2} mt={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={isDisabled || loadingAction !== null}
            sx={{
              "&.Mui-disabled": {
                backgroundColor: "primary.main",
                color: "white",
                opacity: 0.6,
              },
            }}
          >
            {loadingAction === "login" ? "Logging in…" : "Login"}
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={handleRegister}
            disabled={isDisabled || loadingAction !== null}
            sx={{
              "&.Mui-disabled": {
                backgroundColor: "warning.main",
                color: "white",
                opacity: 0.6,
              },
            }}
          >
            {loadingAction === "register" ? "Registering…" : "Register"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}