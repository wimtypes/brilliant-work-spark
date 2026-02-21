import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/lib/types';
import { KanbanColumn } from '@/components/KanbanColumn';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskCard } from '@/components/TaskCard';
import { ChatPanel } from '@/components/ChatPanel';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To-Do' },
  { id: 'in_progress', title: 'In Progress' },
];

export default function Index() {
  const { tasks, addTask, updateTask, deleteTask, moveTask, getTasksByStatus, refetch } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultStatus(task.status);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask({ ...data, position: tasks.length });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Dropped on a column
    if (overId === 'todo' || overId === 'in_progress') {
      await moveTask(taskId, overId);
      return;
    }

    // Dropped on another task — move to that task's column
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      await moveTask(taskId, overTask.status);
    }
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    let targetStatus: TaskStatus | null = null;

    if (overId === 'todo' || overId === 'in_progress') {
      targetStatus = overId;
    } else {
      const overTaskItem = tasks.find(t => t.id === overId);
      if (overTaskItem) targetStatus = overTaskItem.status;
    }

    if (targetStatus && activeTaskItem.status !== targetStatus) {
      await moveTask(activeId, targetStatus);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar onOpenChat={() => setChatOpen(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div>
            <h1 className="text-xl font-bold text-foreground">Workspace</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your tasks efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setChatOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
            <Button size="sm" className="gap-2" onClick={() => handleAddTask('todo')}>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </header>

        {/* Board */}
        <div className="flex-1 overflow-x-auto p-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex gap-6 h-full">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={getTasksByStatus(col.id)}
                  onAddTask={() => handleAddTask(col.id)}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 scale-105">
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSubmit={handleSubmit}
      />

      {/* AI Chat Panel */}
      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        tasks={tasks}
        onTaskCreated={refetch}
      />
    </div>
  );
}
