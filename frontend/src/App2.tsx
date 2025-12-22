import React, { useState } from "react";
import { Button, Box, Container } from "@mui/material";
import { useAuth } from "./hooks/useAuth";
import { useCommonAppDetails } from "./hooks/useCommon";

import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import UsersPage from "./pages/UsersPage";
import SciencePage from "./pages/SciencePage";
import AppHeader from "./components/AppHeader";

import { tasksButton, usersButton, scienceButton } from "./styles/navButtonStyles";

export default function App() {
    const { token, role, login, logout } = useAuth();
    const [view, setView] = useState<"login" | "tasks" | "users" | "science">("tasks");
    const commonAppDetails = useCommonAppDetails();
    if (!token) return <LoginPage onLogin={login} />;

    return (
        <>
            <AppHeader onLogout={logout} commonAppDetails={commonAppDetails}/>

            {/* Navigation buttons at the top */}
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    p: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <Button
                    variant={view === "tasks" ? "contained" : "outlined"}
                    color="primary"
                    sx={tasksButton}
                    onClick={() => setView("tasks")}
                >
                    Tasks
                </Button>

                {role === "admin" && (
                    <Button
                    variant={view === "users" ? "contained" : "outlined"}
                    sx={usersButton(view === "users")}
                    onClick={() => setView("users")}
                    >
                    Manage Users
                    </Button>
                )}

                <Button
                    variant={view === "science" ? "contained" : "outlined"}
                    sx={scienceButton(view === "science")}
                    onClick={() => setView("science")}
                >
                    Science Schedule
                </Button>
            </Box>

            {/* Page content centered */}
            <Container
                maxWidth="sm"
                sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                }}
            >
                {/* <VersionDisplay version={version} /> */}
                {view === "tasks" && <TasksPage token={token} role={role} />}
                {view === "users" && <UsersPage token={token} role={role} />}
                {view === "science" && <SciencePage />}
        </Container>
        </>
    );
}
