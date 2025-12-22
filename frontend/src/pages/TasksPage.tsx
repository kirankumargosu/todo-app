import {
  Button,
  List,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskItem } from "../components/TaskItem";

type Props = {
  token: string | null;
  role: string | null;
};

export default function TasksPage({ token, role }: Props) {
  const { tasks, loading, loadTasks, addTask, toggleTask, deleteTask } =
    useTasks(token);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async () => {
    await addTask(title, linkUrl, notes);
    setTitle("");
    setNotes("");
    setLinkUrl("");
  };

  return (
    <>
      {role === "admin" && (
        <>
          <TextField
            fullWidth
            label="New Task"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="URL (optional)"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1 }}
            onClick={handleAdd}
          >
            Add Task
          </Button>
        </>
      )}

      {loading && <Typography>Loading…</Typography>}

      <List>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            role={role}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        ))}
      </List>
    </>
  );
}
