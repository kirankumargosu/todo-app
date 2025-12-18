import React, { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  role: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const token = localStorage.getItem("token");

  const loadUsers = async () => {
    const res = await fetch("/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const makeAdmin = async (username: string) => {
    await fetch("/api/auth/users/role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, role: "admin" }),
    });
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} - {u.role}{" "}
            {u.role !== "admin" && (
              <button onClick={() => makeAdmin(u.username)}>Make Admin</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUsers;
