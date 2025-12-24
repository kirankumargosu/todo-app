import {
  Box,
  Checkbox,
  IconButton,
  Link,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Task } from "../types/task";

import { toTitleCase } from "../utils/strings";

type Props = {
  task: Task;
  role: string | null;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskItem({ task, role, onToggle, onDelete }: Props) {
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
          <Box display="flex" justifyContent="space-between">
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
          </>
        }
        secondaryTypographyProps={{ component: "div" }}
      />
    </ListItem>
  );
}
