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
  Tabs,
  Tab,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import { TaskItem } from "../components/TaskItem";
import { toTitleCase } from "../utils/strings";

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
  const [tabIndex, setTabIndex] = useState(0);
  const UNASSIGNED = "Unassigned";
  const loggedInUser = role === "admin" && username ? toTitleCase(username) : null;

  useEffect(() => {
    loadTasks();
    if (role === "admin") {
      loadUsers();
    }
    if (role === "admin" && username) {
    const idx = orderedUsernames.findIndex(
      u => u === toTitleCase(username)
    );
    setTabIndex(idx >= 0 ? idx : 0);
  }
  }, [role]);

  const handleAdd = async () => {
    await addTask(title, linkUrl, notes, assignedUserId);
    setTitle("");
    setNotes("");
    setLinkUrl("");
    setAssignedUserId(null);
  };

  /** 🔐 Admin sees all, users see only their tasks */
  const visibleTasks = useMemo(() => {
    if (role === "admin" || !username) return tasks;
    return tasks.filter(
      t => t.assigned_user?.username === username
    );
  }, [tasks, role, username]);

  /** 👥 Group tasks by assigned user */
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};

    visibleTasks.forEach(task => {
      const key = task.assigned_user
        ? toTitleCase(task.assigned_user.username)
        : "Unassigned";

      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [visibleTasks]);

  const usernames = Object.keys(groupedTasks);

  const orderedUsernames =
    role === "admin" && username
      ? [
          // admin’s own tasks first
          ...usernames.filter(u => u === toTitleCase(username)),
          ...usernames.filter(u => u !== toTitleCase(username)),
        ]
      : usernames;

  const groupKeys = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
  }, [groupedTasks]);

  const allUsers = Object.keys(groupedTasks);

  // logged-in user first (if present)
  const myTab =
    loggedInUser && allUsers.includes(loggedInUser)
      ? [loggedInUser]
      : [];

  // other users (exclude me + Unassigned), sorted alphabetically
  const otherUsers = allUsers
    .filter(
      u => u !== loggedInUser && u !== UNASSIGNED
    )
    .sort((a, b) => a.localeCompare(b));

  // unassigned always last
  const unassignedTab = allUsers.includes(UNASSIGNED)
    ? [UNASSIGNED]
    : [];

  const orderedTabs =
    role === "admin"
      ? [...myTab, ...otherUsers, ...unassignedTab]
      : allUsers;

  const currentGroup = groupKeys[activeTab];

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
              onChange={(e) => setAssignedUserId(e.target.value as number | null)}
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

      {groupKeys.length > 1 && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 3 }}
        >
          {orderedTabs.map(name => (
            <Tab key={name} label={name} />
          ))}
        </Tabs>
      )}

      {currentGroup && (
        <Box sx={{ mt: 2, width: "100%" }}>
          <List>
            {groupedTasks[currentGroup].map(task => (
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
