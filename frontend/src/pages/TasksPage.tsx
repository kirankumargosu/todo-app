import {
  Button,
  List,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  LinearProgress,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { TaskItem } from "../components/TaskItem";
import { toTitleCase } from "../utils/strings";
import { Task } from "../types/task";

type Props = {
  token: string | null;
  role: string | null;
  username: string | null;
};

export default function TasksPage({ token, role, username }: Props) {
  const { tasks, loading, loadTasks, addTask, toggleTask, deleteTask } = useTasks(token);
  const { users, loadUsers } = useUsers(token);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // const completedTasks = tasksInGroup.filter(t => t.completed).length;
  // const totalTasks = tasksInGroup.length;
  // const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;


  const UNASSIGNED = "Unassigned";
  const loggedInUser = username ? toTitleCase(username) : null;

  useEffect(() => {
    loadTasks();
    if (role === "admin") {
      loadUsers();
    }
  }, [role]);

  const handleAdd = async () => {
    await addTask(title, linkUrl, notes, assignedUserId);
    setTitle("");
    setNotes("");
    setLinkUrl("");
    setAssignedUserId(null);
  };

  // Only admin sees all tasks; other users see only their own
  const visibleTasks = useMemo(() => {
    if (role === "admin") return tasks;
    return tasks.filter((t) => t.assigned_user?.username === username);
  }, [tasks, role, username]);

  // Helper: sort tasks -> incomplete first, then completed, both alphabetically by title
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  };

  // Group tasks by assigned user
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    visibleTasks.forEach((task) => {
      const key = task.assigned_user ? toTitleCase(task.assigned_user.username) : UNASSIGNED;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    // Sort tasks within each group
    Object.keys(groups).forEach((k) => {
      groups[k] = sortTasks(groups[k]);
    });

    return groups;
  }, [visibleTasks]);

  // Prepare tab order
  const allUsers = Object.keys(groupedTasks);
  const myTab = loggedInUser && allUsers.includes(loggedInUser) ? [loggedInUser] : [];
  const otherUsers = allUsers
    .filter((u) => u !== loggedInUser && u !== UNASSIGNED)
    .sort((a, b) => a.localeCompare(b));
  const unassignedTab = allUsers.includes(UNASSIGNED) ? [UNASSIGNED] : [];
  const orderedTabs = role === "admin" ? [...myTab, ...otherUsers, ...unassignedTab] : allUsers;

  const currentGroup = orderedTabs[activeTab];

  // Compute completion percentage for progress bar
  const completionPercent = currentGroup
    ? groupedTasks[currentGroup].length > 0
      ? Math.round(
          (groupedTasks[currentGroup].filter((t) => t.completed).length /
            groupedTasks[currentGroup].length) *
            100
        )
      : 0
    : 0;

  return (
    <>
      {role === "admin" && (
        <>
          <TextField
            fullWidth
            label="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="URL (optional)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            sx={{ mt: 1 }}
          />

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="user-select-label">Assign to User</InputLabel>
            <Select
              labelId="user-select-label"
              value={assignedUserId ?? ""}
              label="Assign to User"
              onChange={(e) => setAssignedUserId(e.target.value as number | null)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {toTitleCase(user.username)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={handleAdd}>
            Add Task
          </Button>
        </>
      )}

      {/* Tabs */}
      {orderedTabs.length > 0 && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 3 }}
        >
          {orderedTabs.map((name) => (
            <Tab key={name} label={name} />
          ))}
        </Tabs>
      )}

      {/* Progress bar */}
      {currentGroup && groupedTasks[currentGroup].length > 0 && currentGroup && groupedTasks[currentGroup].length > 0 && (
        <Box sx={{ width: "100%", mb: 2, mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={completionPercent}
            sx={{
              height: 4,
              borderRadius: 2,
              borderColor: "#5d5b5bff",
              backgroundColor: "#e48d8dff",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#96cc8cff",
              },
            }}
          />
        </Box>
      )}

      {/* Task list */}
      {currentGroup && groupedTasks[currentGroup].length > 0 && (
        <Box sx={{ mt: 2, width: "100%" }}>
          <List>
            {groupedTasks[currentGroup].map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                role={role}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </List>
        </Box>
      )}
    </>
  );
}
