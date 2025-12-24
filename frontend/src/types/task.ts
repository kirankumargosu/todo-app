export interface Task {
  id: number;
  title: string;
  completed: boolean;
  link_url?: string | null;
  notes?: string | null;
  assigned_user_id?: number | null;

  assigned_user?: {
    id: number;
    username: string;
  } | null;
}
