import { SxProps, Theme } from "@mui/material";

export const tasksButton: SxProps<Theme> = {
  // Use MUI primary color; you can override if needed
};

export const usersButton = (active: boolean): SxProps<Theme> => ({
  backgroundColor: active ? "#f57c00" : "transparent",
  color: active ? "white" : "#f57c00",
  borderColor: "#f57c00",
  "&:hover": {
    backgroundColor: active ? "#ef6c00" : "rgba(245, 124, 0, 0.1)",
  },
});

export const scienceButton = (active: boolean): SxProps<Theme> => ({
  backgroundColor: active ? "#388e3c" : "transparent",
  color: active ? "white" : "#388e3c",
  borderColor: "#388e3c",
  "&:hover": {
    backgroundColor: active ? "#2e7d32" : "rgba(56, 142, 60, 0.1)",
  },
});

export const wrenAndMartinButton = (active: boolean): SxProps<Theme> => ({
  backgroundColor: active ? "#8e3849ff" : "transparent",
  color: active ? "white" : "#8e3842ff",
  borderColor: "#8e384cff",
  "&:hover": {
    backgroundColor: active ? "#7d2e36ff" : "rgba(142, 56, 60, 0.1)",
  },
});

export const mediaButton = (active: boolean): SxProps<Theme> => ({
  backgroundColor: active ? "#38888eff" : "transparent",
  color: active ? "white" : "#388e88ff",
  borderColor: "#388e88ff",
  "&:hover": {
    backgroundColor: active ? "#2e787dff" : "rgba(56, 135, 142, 0.1)",
  },
});

export const homeButton = (active: boolean): SxProps<Theme> => ({
  backgroundColor: active ? "#2b4e9aff" : "transparent",
  color: active ? "white" : "#2b4e9aff",
  borderColor: "#2b4e9aff",
  "&:hover": {
    backgroundColor: active ? "#14357cff" : "rgba(7, 14, 65, 0.1)",
  },
});
