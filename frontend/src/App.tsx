import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  Checkbox,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface User {
  id: number;
  username: string;
  role: string;
}

// const API = "/api";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000" || "/api";


const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [view, setView] = useState<"login" | "register" | "tasks" | "users">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
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
    const res = await fetch(`${API_URL}/auth/login`, {
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
    const res = await fetch(`${API_URL}/auth/register`, {
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
    const res = await fetch(`${API_URL}/tasks`, { headers: authHeaders() });
    setTasks(await res.json());
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    });
    setTitle("");
    loadTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTasks();
  };

  // ---------- USERS (ADMIN) ----------

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
    setUsers(await res.json());
  };

  const promote = async (username: string) => {
    await fetch(`${API_URL}/auth/users/role`, {
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
        <Typography variant="h5">To‑Do App</Typography>
        <Typography variant="caption">Role: {role}</Typography>

        <Button onClick={logout}>Logout</Button>
        {role === "admin" && <Button onClick={() => { setView("users"); loadUsers(); }}>Manage Users</Button>}
        <Button onClick={() => { setView("tasks"); loadTasks(); }}>Tasks</Button>

        {view === "tasks" && (
          <>
            {role === "admin" && (
              <>
                <TextField fullWidth label="New Task" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Button fullWidth variant="contained" onClick={addTask}>Add Task</Button>
              </>
            )}

            <List>
              {tasks.map((t) => (
                <ListItem key={t.id} secondaryAction={role === "admin" && (
                  <IconButton onClick={() => deleteTask(t.id)}><DeleteIcon /></IconButton>
                )}>
                  <Checkbox checked={t.completed} onChange={() => toggleTask(t)} />
                  <Typography style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</Typography>
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
