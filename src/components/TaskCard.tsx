import { Task, getCategoryColor } from '@/lib/types';
import { Calendar, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group rounded-xl border border-border bg-card p-4 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {task.category && (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white mb-2 ${getCategoryColor(task.category)}`}
            >
              {task.category}
            </span>
          )}
          <h4 className="text-sm font-semibold text-card-foreground leading-snug">{task.title}</h4>
          {task.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
        {task.time_estimate && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.time_estimate}
          </span>
        )}
      </div>
    </motion.div>
  );
}
