import { useState } from "react";
import { Task } from "../types/task";
import { TASK_API_URL } from "../api/config";

export function useTasks(token: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const loadTasks = async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${TASK_API_URL}/tasks`, {
      headers: authHeaders(),
    });    
    setTasks(await res.json());
    setLoading(false);
  };

  const addTask = async (
    title: string,
    link_url?: string,
    notes?: string,
    assigned_user_id?: number | null
  ) => {
    if (!title.trim()) return;
    await fetch(`${TASK_API_URL}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        link_url: link_url || null,
        notes: notes || null,
        assigned_user_id: assigned_user_id ?? null,
      }),
    });
    loadTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch(`${TASK_API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        ...task,
        completed: !task.completed,
      }),
    });
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`${TASK_API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadTasks();
  };

  return {
    tasks,
    loading,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
  };
}
