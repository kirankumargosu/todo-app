import { useState } from "react";
import { Button, Box, Container} from "@mui/material";
import { useAuth } from "./hooks/useAuth";
import { useCommonAppDetails } from "./hooks/useCommon";

import AppHeader from "./components/AppHeader";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import UsersPage from "./pages/UsersPage";
import SciencePage from "./pages/SciencePage";
import CameraPage from "./pages/CameraPage";
import ProfilePage from "./pages/ProfilePage";
import MediaPage from "./pages/MediaPage";


import { tasksButton, usersButton, scienceButton, homeButton } from "./styles/navButtonStyles";



export default function App() {
    const { token, role, login, register, logout, username } = useAuth();
    const [view, setView] = useState<"login" | "tasks" | "users" | "science" | "home" | "profile" | "media">("tasks");
    const commonAppDetails = useCommonAppDetails();
    const HOME_AUTOMATION_ENABLED = process.env.REACT_APP_HOME_AUTOMATION ?? true;
    if (!token) return <LoginPage onLogin={login} onRegister={register}/>;

    return (
        <>
            <AppHeader
                onLogout={logout}
                onProfileClick={() => setView("profile")}
                username={username}
                commonAppDetails={commonAppDetails}
            />
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
                    {role !== "guest" && (
                        <Button
                            variant={view === "media" ? "contained" : "outlined"}
                            onClick={() => setView("media")}
                        >
                        Media
                </Button>
                )}

                {role === "admin" && HOME_AUTOMATION_ENABLED && (
                    <Button
                    variant={view === "home" ? "contained" : "outlined"}
                    sx={homeButton(view === "home")}
                    onClick={() => setView("home")}
                    >
                    Home Automation
                    </Button>
                )}
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
                {view === "tasks" && <TasksPage token={token} role={role} username={username} />}
                {view === "users" && <UsersPage token={token} role={role} />}
                {view === "home" && <CameraPage token={token} role={role} />}
                {view === "media" && <MediaPage token={token} role={role} />}
                {view === "science" && <SciencePage />}
                {view === "profile" && <ProfilePage />}
        </Container>
        </>
    );
}
