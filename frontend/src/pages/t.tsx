import {
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { TaskItem } from "../components/TaskItem";
import { toTitleCase } from "../utils/strings";

type Props = {
  token: string | null;
  role: string | null;
};

export default function TasksPage({ token, role }: Props) {
  const { tasks, loading, loadTasks, addTask, toggleTask, deleteTask } = useTasks(token);
  const { users, loadUsers } = useUsers(token);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null);

  // 🔹 Fixed useEffect: only run once on mount (or when role changes)
  useEffect(() => {
    loadTasks();
    if (role === "admin") {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleAdd = async () => {
    await addTask(title, linkUrl, notes, assignedUserId);
    setTitle("");
    setNotes("");
    setLinkUrl("");
    setAssignedUserId(null);
  };

  // Group tasks by assigned user
  const groupedTasks: Record<string, typeof tasks> = tasks.reduce((acc, task) => {
    const user = task.assigned_user ? toTitleCase(task.assigned_user.username) : "Unassigned";
    if (!acc[user]) acc[user] = [];
    acc[user].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

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

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="user-select-label">Assign to User</InputLabel>
            <Select
              labelId="user-select-label"
              value={assignedUserId ?? ""}
              label="Assign to User"
              onChange={e => setAssignedUserId(Number(e.target.value))}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {toTitleCase(user.username)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

      {/* Grouped tasks display */}
      {Object.entries(groupedTasks).map(([username, tasksInGroup]) => (
        <Box key={username} sx={{ mt: 3, width: "100%" }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {username}
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small" aria-label={`${username} tasks`}>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Link</TableCell>
                  {role === "admin" && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasksInGroup.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    role={role}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </>
  );
}
