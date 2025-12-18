export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export interface User {
    username: string;
    role: "admin" | "user";
}