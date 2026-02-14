import {
  Box,
  Checkbox,
  IconButton,
  Link,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Chip,
} from "@mui/material";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Task } from "../types/task";

import { toTitleCase } from "../utils/strings";

type Props = {
  task: Task;
  role: string | null;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
  onUpdate: (task: Task) => void;
};

export function TaskItem({ task, role, onToggle, onDelete, onUpdate }: Props) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(task.task_notes || "");

  const handleSaveNotes = () => {
    onUpdate({ ...task, task_notes: notesValue });
    setEditingNotes(false);
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 1,
        mb: 1,
      }}
      secondaryAction={
        role === "admin" && (
          <IconButton onClick={() => onDelete(task.id)}>
            <DeleteIcon />
          </IconButton>
        )
      }
    >
      {role !== "ro" && (
        <Checkbox
          checked={task.completed}
          onChange={() => onToggle(task)}
          sx={{ mr: 2, mt: 0.5 }}
        />
      )}

      <ListItemText
        primary={
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <Typography
                variant="subtitle1"
                sx={{
                  textDecoration: task.completed
                    ? "line-through"
                    : "none",
                }}
              >
                {task.title}
              </Typography>
            </Box>

            {task.link_url && (
              <IconButton
                component="a"
                href={task.link_url}
                target="_blank"
                size="small"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        primaryTypographyProps={{ component: "div" }}
        secondary={
          <>
            {/* 🆕 Assigned user */}
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              {/* <PersonIcon fontSize="small" color="action" /> */}
              {/* <Typography variant="body2" color="text.secondary">
                {task.assigned_user
                  ? toTitleCase(task.assigned_user.username)
                  : "Unassigned"}
              </Typography> */}
            </Box>

            {task.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {task.notes}
              </Typography>
            )}

            {task.link_url && (
              <Link
                href={task.link_url}
                target="_blank"
                variant="body2"
              >
                {task.link_url}
              </Link>
            )}

            {/* {task.task_notes && !editingNotes ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", mt: 0.5, p: 1, bgcolor: "#f5f5f5", borderLeft: "3px solid #ccc", cursor: "pointer" }}
                onClick={() => setEditingNotes(true)}
              >
                <strong>Latest Notes:</strong> {task.task_notes}
              </Typography>
            ) : (
              <Box sx={{ mt: 0.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add/Edit Notes"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onBlur={handleSaveNotes}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNotes()}
                  variant="outlined"
                  autoFocus={editingNotes}
                />
              </Box>
            )} */}

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: "block", mt: 0.5, fontSize: "0.75rem" }}
            >
              {/* Updated at: {new Date(task.last_updated_at).toLocaleString()} {task.last_updated_by && `by ${task.last_updated_by}`} */}
              Updated at: {new Date(task.last_updated_at).toLocaleString()}
              {/* {task.last_updated_by && (
                <Chip
                  label={task.last_updated_by}
                  size="small"
                  variant="outlined"
                  sx={{ height: "20px", fontSize: "0.7rem" }}
                />
              )} */}
            </Typography>
            {task.last_updated_by && (
              <Chip
                label={toTitleCase(task.last_updated_by)}
                size="small"
                variant="outlined"
                sx={{
                  height: "20px",
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(174, 199, 225, 0.1)",
                  borderColor: "rgba(100, 150, 200, 0.3)"
                }}
              />
            )}
          </>
        }
        secondaryTypographyProps={{ component: "div" }}
      />
    </ListItem>
  );
}
