import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  Checkbox,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Task } from "./types";
import { getTasks, createTask, updateTask, deleteTask } from "./api";
import Login from "./Login";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const role = localStorage.getItem("username"); // "admin" | "user"

  const loadTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    if (loggedIn) {
      loadTasks();
    }
  }, [loggedIn]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTask(title);
    setTitle("");
    loadTasks();
  };

  const handleToggle = async (task: Task) => {
    await updateTask({ ...task, completed: !task.completed });
    loadTasks();
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    loadTasks();
  };

  // 🔒 Not logged in → show login screen
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  // ✅ Logged in → show app
  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Paper style={{ padding: 24 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          To-Do List
        </Typography>

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Logged in as: {role}
        </Typography>

        {role === "admin" && (
          <>
            <TextField
              fullWidth
              label="New Task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              style={{ marginTop: 12 }}
              onClick={handleAdd}
            >
              Add Task
            </Button>
          </>
        )}

        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              secondaryAction={
                role === "admin" && (
                  <IconButton onClick={() => handleDelete(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <Checkbox
                checked={task.completed}
                disabled={role !== "user"}
                onChange={() => handleToggle(task)}
              />

              <Typography
                style={{
                  marginLeft: 8,
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default App;
