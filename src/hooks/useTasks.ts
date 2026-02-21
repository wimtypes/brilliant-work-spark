import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/lib/types';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      toast.error('Failed to add task');
      console.error(error);
      return null;
    }
    setTasks(prev => [...prev, data as Task]);
    toast.success('Task added');
    return data as Task;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update task');
      console.error(error);
      return;
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      console.error(error);
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    refetch: fetchTasks,
  };
}
