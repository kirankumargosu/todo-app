import { useState, useCallback } from "react";
import { AUTH_API_URL } from "../api/config"
import type { UseAuthReturn } from "../types/auth";

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [username, setUserName] = useState<string | null>(localStorage.getItem("username"));

  const login: (username: string, password: string) => Promise<void> = useCallback(
    async (username: string, password: string) => {
      const res = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      setToken(data.access_token);
      setRole(data.role);
      setUserName(data.username)
    },
    []
  );

  const register: (username: string, password: string) => Promise<void> = useCallback(
    async (username: string, password: string) => {
      const res = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      setToken(data.access_token);
      setRole(data.role);
      setUserName(data.username)
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  }, []);

  return { token, role, login, register, logout, username };
}
