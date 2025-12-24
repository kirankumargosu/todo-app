export interface Task {
  id: number;
  title: string;
  completed: boolean;
  link_url?: string | null;
  notes?: string | null;
  assigned_to?: number;
}
