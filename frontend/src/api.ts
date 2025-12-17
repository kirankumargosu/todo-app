import axios from "axios";
import { Task } from "./types";

// const API_URL = "http://localhost:8000";
const API_URL = "/api";

export const getTasks = () => axios.get<Task[]>(`${API_URL}/tasks`);

export const createTask = (title: string) =>
    axios.post<Task>(`${API_URL}/tasks`, { title });

export const updateTask = (task: Task) =>
    axios.put<Task>(`${API_URL}/tasks/${task.id}`, task);

export const deleteTask = (id: number) =>
    axios.delete(`${API_URL}/tasks/${id}`);