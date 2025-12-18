import axios from "axios";
import { Task, User } from "./types";

// const API_URL = "http://localhost:8000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000" || "/api";

export const getTasks = () => axios.get<Task[]>(`${API_URL}/tasks`);

export const createTask = (title: string) =>
    axios.post<Task>(`${API_URL}/tasks`, { title });

export const updateTask = (task: Task) =>
    axios.put<Task>(`${API_URL}/tasks/${task.id}`, task);

export const deleteTask = (id: number) =>
    axios.delete(`${API_URL}/tasks/${id}`);


export const login = (username: string, password: string) =>
    axios.post<User>(`${API_URL}/login`, { username, password });

// export const login = (username: string, password: string) =>
//     axios.post(`${API_URL}/auth/login`, { username, password });

export const apiFetch = (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
};
