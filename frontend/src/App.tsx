import React, { useEffect, useState } from "react";
import {
  AppBar,
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
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
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

interface VersionResponse {
  ui_version: string;
  backend_version: string;
  app_version: string;
};

// const API = "/api";
const API_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8000";
const TASK_API_URL = `${API_URL}/task`;
const AUTH_API_URL = `${API_URL}/auth`;
const COMMON_API_URL = `${API_URL}/common`;

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [view, setView] = useState<"login" | "register" | "tasks" | "users" | "science">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [version, setVersion] = useState<VersionResponse | null>(null);
  const [appversion, setAppVersion] = useState("");
  const [uiversion, setUiVersion] = useState("");
  const [backendversion, setBackendVersion] = useState("");

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

  // Science schedule (admin only)
  const [weeks, setWeeks] = useState<Array<{ from: string; to: string; study: string[] }>>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [loadingScience, setLoadingScience] = useState(false);

  const loadVersions = async () => {
    const res = await fetch(`${COMMON_API_URL}/version`, {
      headers: authHeaders(),
    });

    const data: VersionResponse = await res.json();
    setVersion(data);
  };

  useEffect(() => {
    loadVersions();
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
    localStorage.setItem("username", data.username)
    setUsername(data.username)
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

  // ---------- SCIENCE (ADMIN) ----------

  const loadScience = async () => {
    setLoadingScience(true);
    try {
      const res = await fetch(`/science-ks3.json`);
      if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);
      const data = await res.json();
      setWeeks(data);
      setCurrentWeekIndex(0);
      setView("science");
    } catch (err: any) {
      console.error(err);
      alert("Failed to load science schedule");
    } finally {
      setLoadingScience(false);
    }
  };

  const prevWeek = () => setCurrentWeekIndex((i) => Math.max(0, i - 1));
  const nextWeek = () => setCurrentWeekIndex((i) => Math.min(weeks.length - 1, i + 1));

  const parseDayMonth = (s: string, year: number): Date | null => {
    if (!s) return null;
    const parts = s.split("-").map((p) => p.trim());
    if (parts.length !== 2) return null;
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const month = new Date(`${monthStr} 1, 2000`).getMonth();
    if (isNaN(day) || isNaN(month)) return null;
    return new Date(year, month, day);
  };

  const findIndexForDate = (d: Date): number => {
    const yearNow = d.getFullYear();
    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i];
      for (let delta = -1; delta <= 1; delta++) {
        const yr = yearNow + delta;
        const fromDate = parseDayMonth(w.from, yr);
        const toDate = parseDayMonth(w.to, yr);
        if (!fromDate || !toDate) continue;
        // Handle ranges that span year boundary
        if (toDate < fromDate) toDate.setFullYear(toDate.getFullYear() + 1);
        if (d >= fromDate && d <= toDate) return i;
      }
    }
    return -1;
  };

  const jumpToCurrentWeek = () => {
    const idx = findIndexForDate(new Date());
    if (idx >= 0) setCurrentWeekIndex(idx);
    else alert("Current week not found in schedule");
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40;
    if (dx > threshold) prevWeek();
    else if (dx < -threshold) nextWeek();
    setTouchStartX(null);
  };

  const promote = async (username: string, role: string) => {
    await fetch(`${AUTH_API_URL}/users/role`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ username, role }),
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
    <>
     <AppBar position="static" />
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Paper style={{ padding: 24 }}>
        <Typography variant="h5">The Baa Family To-Do App</Typography>        
        <Typography variant="caption" display="block">User: {toTitleCase(localStorage.getItem("username") || '')}</Typography>
        {/* {console.log(version['ui_version'])} */}
        <Typography variant="caption" fontSize="x-small" color="gray">Version: {version?.app_version}.{version?.ui_version}.{version?.backend_version} </Typography>
        <br />
        <Button onClick={() => { setView("tasks"); loadTasks(); }}>Tasks</Button>
        {<Button onClick={() => { loadScience(); }} disabled={loadingScience}>Science Schedule</Button>}
        {/* {role === "admin" && <Button onClick={() => { loadScience(); }} disabled={loadingScience}>Science Schedule</Button>} */}
        {role === "admin" && <Button onClick={() => { setView("users"); loadUsers(); }}>Manage Users</Button>}
        <Button onClick={logout}>Logout</Button>
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
                  {role != "ro" && (<Checkbox checked={t.completed} onChange={() => toggleTask(t)} sx={{ mr: 2, mt: 0.5 }} />)}
                  

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
          <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableCell> Name </TableCell>
                <TableCell> Current Role </TableCell>
                <TableCell> Make Admin </TableCell>
                <TableCell> Make User</TableCell>
                <TableCell> Make Readonly </TableCell>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow>
                    <TableCell>
                      {toTitleCase(u.username)}
                    </TableCell>
                    <TableCell>
                      {toTitleCase(u.role)}
                    </TableCell>

                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => promote(u.username, 'admin')}>Admin</Button>
                    </TableCell>

                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => promote(u.username, 'user')}>User</Button>
                    </TableCell>

                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => promote(u.username, 'ro')}>Readonly</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {view === "science" && (
          <Box
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{ mt: 2 }}
          >
            {weeks.length === 0 ? (
              <Typography>{loadingScience ? "Loading..." : "No schedule available."}</Typography>
            ) : (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Button onClick={prevWeek} disabled={currentWeekIndex === 0}>Prev</Button>
                  <Typography variant="h6">{weeks[currentWeekIndex].from} — {weeks[currentWeekIndex].to}</Typography>
                  <Button onClick={nextWeek} disabled={currentWeekIndex === weeks.length - 1}>Next</Button>
                </Box>

                <Box display="flex" justifyContent="center" sx={{ mb: 1 }}>
                  <Button onClick={jumpToCurrentWeek} disabled={weeks.length === 0}>Jump to current week</Button>
                </Box>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <List>
                    {weeks[currentWeekIndex].study.map((s, idx) => {
                      const parts = s.split(":");
                      const subject = parts[0] || "";
                      const chapter = parts[1] || "";
                      const title = parts.slice(2).join(":") || "";
                      return (
                        <ListItem key={idx} sx={{ alignItems: 'flex-start' }}>
                          <ListItemText
                            primary={<Typography variant="subtitle1">{title}</Typography>}
                            secondary={<>
                              <Typography variant="body2" color="textSecondary">{subject} • {chapter}</Typography>
                            </>}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>

                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Swipe left/right or use Prev/Next to navigate weeks</Typography>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
    </>
  );
};

export default App;
