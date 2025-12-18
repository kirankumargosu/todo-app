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
const role = localStorage.getItem("role"); // "admin" | "user"

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

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

  return (
  <Container maxWidth="sm" style={{ marginTop: 40 }}>
    <Paper style={{ padding: 24 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        To-Do List
      </Typography>

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

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <IconButton onClick={() => handleDelete(task.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <Checkbox
              checked={task.completed}
              onChange={() => handleToggle(task)}
            />

            <Typography
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </Typography>
          </ListItem>
        ))
        }
      </List>
    </Paper>
  </Container>
  );
};

export default App;