import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { CommonAppDetails } from "../types/common";

type AppHeaderProps = {
    onLogout: () => void;
    onProfileClick: () => void;
    username?: string | null;
    commonAppDetails?: CommonAppDetails | null;
};

export default function AppHeader({ onLogout, onProfileClick, username, commonAppDetails }: AppHeaderProps) {
    const versionText = commonAppDetails
        ? `${commonAppDetails.app_version}.${commonAppDetails.ui_version}.${commonAppDetails.backend_version}`
        : "";
    const appName = commonAppDetails?.app_name;

    return (
        <AppBar position="static">
            <Toolbar sx={{ flexDirection: "column", alignItems: "stretch", gap: 0.5 }}>
                {/* Top row: app name on left, logout + profile on right */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">{appName}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {username && (
                            <Tooltip title={`Logged in as ${username}`}>
                                <IconButton color="inherit" onClick={onProfileClick}>
                                    <AccountCircleIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Button color="inherit" onClick={onLogout}>
                            Logout
                        </Button>
                    </Box>
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