import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Link,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  link_url?: string | null;
  notes?: string | null;
}

interface User {
  id: number;
  username: string;
  role: string;
}

// const API = "/api";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000" || "/api";
const TASK_API_URL = `${API_URL}/task`;
const AUTH_API_URL = `${API_URL}/auth`;

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [view, setView] = useState<"login" | "register" | "tasks" | "users">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toTitleCase = (s: string) =>
    s
      ? s
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ")
      : "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (token) {
      setView("tasks");
      loadTasks();
    }
  }, [token]);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });


  // ---------- AUTH ----------

  const login = async () => {
    setError("");
    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Login failed");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    setToken(data.access_token);
    setRole(data.role);
  };

  const register = async () => {
    setError("");
    const res = await fetch(`${AUTH_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Registration failed");
      return;
    }

    setView("login");
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setView("login");
  };

  // ---------- TASKS ----------

  const loadTasks = async () => {
    const res = await fetch(`${TASK_API_URL}/tasks`, { headers: authHeaders() });
    setTasks(await res.json());
  };

  const addTask = async () => {
    if (!title.trim()) return;
    console.log({ title, link_url: linkUrl, notes });
    await fetch(`${TASK_API_URL}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, link_url: linkUrl || null, notes: notes || null }),
    });
    setTitle("");
    setLinkUrl("");
    setNotes("");
    loadTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch(`${TASK_API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`${TASK_API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTasks();
  };

  // ---------- USERS (ADMIN) ----------

  const loadUsers = async () => {
    const res = await fetch(`${AUTH_API_URL}/users`, { headers: authHeaders() });
    setUsers(await res.json());
  };

  const promote = async (username: string) => {
    await fetch(`${AUTH_API_URL}/users/role`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ username, role: "admin" }),
    });
    loadUsers();
  };

  // ---------- UI ----------

  if (!token) {
    return (
      <Container maxWidth="sm" style={{ marginTop: 40 }}>
        <Paper style={{ padding: 24 }}>
          <Typography variant="h5">{view === "login" ? "Login" : "Register"}</Typography>

          <TextField fullWidth label="Username" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <Typography color="error">{error}</Typography>}

          {view === "login" ? (
            <>
              <Button fullWidth variant="contained" onClick={login}>Login</Button>
              <Button fullWidth onClick={() => setView("register")}>Register</Button>
            </>
          ) : (
            <>
              <Button fullWidth variant="contained" onClick={register}>Register</Button>
              <Button fullWidth onClick={() => setView("login")}>Back to Login</Button>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Paper style={{ padding: 24 }}>
        <Typography variant="h5">The Baa Family To‑Do App</Typography>
        <Typography variant="caption">User: {toTitleCase(username)}</Typography>
        <br />
        <Button onClick={logout}>Logout</Button>
        {role === "admin" && <Button onClick={() => { setView("users"); loadUsers(); }}>Manage Users</Button>}
        <Button onClick={() => { setView("tasks"); loadTasks(); }}>Tasks</Button>

        {view === "tasks" && (
          <>
            {role === "admin" && (
              <>
                <TextField fullWidth label="New Task" value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextField fullWidth label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ marginTop: 8 }} />
                <TextField fullWidth label="URL (optional)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} style={{ marginTop: 8 }} />
                <Button fullWidth variant="contained" onClick={addTask} sx={{ marginTop: 1 }}>Add Task</Button>
              </>
            )}

            <List>
              {tasks.map((t) => (
                <ListItem key={t.id} alignItems="flex-start" secondaryAction={role === "admin" && (
                  <IconButton onClick={() => deleteTask(t.id)}><DeleteIcon /></IconButton>
                )}>
                  <Checkbox checked={t.completed} onChange={() => toggleTask(t)} sx={{ mr: 2, mt: 0.5 }} />

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</Typography>
                        {t.link_url && (
                          <IconButton component="a" href={t.link_url} target="_blank" rel="noopener noreferrer" size="small" aria-label="open link">
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Box>
                        {t.notes && (
                          <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>{t.notes}</Typography>
                        )}
                        {t.link_url && (
                          <Link href={t.link_url} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ display: 'block', mt: 0.5 }}>{t.link_url}</Link>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {view === "users" && role === "admin" && (
          <List>
            {users.map((u) => (
              <ListItem key={u.id}>
                {u.username} — {u.role}
                {u.role !== "admin" && (
                  <Button onClick={() => promote(u.username)}>Make Admin</Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default App;
