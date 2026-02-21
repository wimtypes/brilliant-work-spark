import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[340px] max-w-[400px] flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary/10 px-1.5 text-[11px] font-bold text-primary">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2.5 min-h-[200px] transition-colors ${
          isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed' : 'bg-muted/40'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No tasks yet</p>
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={onAddTask}>
              <Plus className="mr-1 h-3 w-3" /> Add a task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
