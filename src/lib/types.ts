export type TaskStatus = 'todo' | 'in_progress';

export type TaskCategory = 'Design' | 'Development' | 'Marketing' | 'Data' | 'Media' | string;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: string | null;
  due_date: string | null;
  time_estimate: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Design: 'bg-[hsl(var(--cat-design))]',
  Development: 'bg-[hsl(var(--cat-development))]',
  Marketing: 'bg-[hsl(var(--cat-marketing))]',
  Data: 'bg-[hsl(var(--cat-data))]',
  Media: 'bg-[hsl(var(--cat-media))]',
};

export function getCategoryColor(category: string | null): string {
  if (!category) return 'bg-[hsl(var(--cat-default))]';
  return CATEGORY_COLORS[category] || 'bg-[hsl(var(--cat-default))]';
}

export const CATEGORIES = ['Design', 'Development', 'Marketing', 'Data', 'Media'];
