import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Task, TaskStatus, CATEGORIES } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  due_date: string;
  time_estimate: string;
  status: TaskStatus;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSubmit: (data: TaskFormData) => void;
}

export function TaskDialog({ open, onOpenChange, task, defaultStatus = 'todo', onSubmit }: TaskDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      due_date: '',
      time_estimate: '',
      status: defaultStatus,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        category: task.category || '',
        due_date: task.due_date || '',
        time_estimate: task.time_estimate || '',
        status: task.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        category: '',
        due_date: '',
        time_estimate: '',
        status: defaultStatus,
      });
    }
  }, [task, defaultStatus, reset]);

  const onFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Task title…" {...register('title', { required: true })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="What needs to be done?" rows={3} {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To-Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time_estimate">Time Estimate</Label>
              <Input id="time_estimate" placeholder="e.g. 3h" {...register('time_estimate')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{task ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
