import React, { useEffect } from "react";
import {
  Button,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useUsers } from "../hooks/useUsers";
import { toTitleCase } from "../utils/strings";
import { User } from "../types/user";
import { roleColors } from "../utils/roles";

type UsersPageProps = {
  token: string | null;
  role: string | null;
};

export default function UsersPage({ token, role }: UsersPageProps) {
  const { users, loading, error, loadUsers, promote } = useUsers(token);

  useEffect(() => {
    if (role === "admin") {
      loadUsers();
    }
  }, [role, loadUsers]);

  if (role !== "admin") {
    return <Typography>Access denied</Typography>;
  }

  if (loading) return <Typography>Loading users…</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  
  const groupedUsers: Record<string, User[]> = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<string, User[]>);
  return (
    <Box sx={{ width: "100%" }}>
      {Object.entries(groupedUsers).map(([roleName, usersInRole]) => (
        <Box key={roleName} sx={{ mb: 3 }}>
          {/* Role header */}
          <Typography variant="subtitle1" sx={{ color: roleColors[roleName], mb: 1 }}>
            {roleName.toUpperCase()}
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small" aria-label={`${roleName} users`}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Current Role</TableCell>
                  <TableCell>Make Admin</TableCell>
                  <TableCell>Make User</TableCell>
                  <TableCell>Make Readonly</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersInRole.map((u) => (
                  <TableRow key={u.id} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}>
                    <TableCell>{toTitleCase(u.username)}</TableCell>
                    <TableCell>
                      <Chip
                        label={toTitleCase(u.role)}
                        size="small"
                        sx={{ backgroundColor: roleColors[u.role], color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => promote(u.username, "admin")}
                      >
                        Admin
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => promote(u.username, "user")}
                      >
                        User
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => promote(u.username, "ro")}
                      >
                        Readonly
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}
