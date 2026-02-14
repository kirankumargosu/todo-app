export interface Task {
  id: number;
  title: string;
  completed: boolean;
  link_url?: string | null;
  notes?: string | null;
  task_notes?: string | null;
  assigned_user_id?: number | null;
  last_updated_at: string; // ISO date string
  last_updated_by?: string | null;

  assigned_user?: {
    id: number;
    username: string;
  } | null;
}
