import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import type { CommonAppDetails } from "../types/common";

type AppHeaderProps = {
    onLogout: () => void;
    commonAppDetails?: CommonAppDetails | null;
};

export default function AppHeader({ onLogout, commonAppDetails }: AppHeaderProps) {
    const versionText = commonAppDetails
        ? `${commonAppDetails.app_version}.${commonAppDetails.ui_version}.${commonAppDetails.backend_version}`
        : "";
    const appName = commonAppDetails?.app_name;
    return (
    <AppBar position="static">
      <Toolbar sx={{ flexDirection: "column", alignItems: "stretch", gap: 0.5 }}>
        {/* Top row: app name on left, logout on right */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{appName}</Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Box>

        {/* Version row under app name */}
        {versionText && (
          <Typography
            variant="caption"
            sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.7)" }}
          >
            Version: {versionText}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
    );
}
