import { useState, useCallback } from "react";
import { User } from "../types/user";
import { AUTH_API_URL } from "../api/config";

export function useUsers(token: string | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUTH_API_URL}/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  const promote = useCallback(
    async (username: string, role: string) => {
      if (!token) return;
      try {
        await fetch(`${AUTH_API_URL}/users/role`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ username, role }),
        });
        await loadUsers();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to update role");
      }
    },
    [token, authHeaders, loadUsers]
  );

  return { users, loading, error, loadUsers, promote };
}
