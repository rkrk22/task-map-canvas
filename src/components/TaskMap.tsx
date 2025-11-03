import { useEffect, useState, useRef } from "react";
import { TaskBlock } from "./TaskBlock";
import { TaskSidebar } from "./TaskSidebar";
import { EditTaskDialog } from "./EditTaskDialog";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ParticleBurst } from "./ParticleBurst";
import taskDoneSound from "@/assets/task_done_sound.wav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Wifi, WifiOff } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { LocalTask } from "@/lib/db";

export const TaskMap = () => {
  const { tasks, isOnline, createTask, updateTask, deleteTask, retryFailedTask } = useTasks();
  const [conflictDialog, setConflictDialog] = useState<{
    newTask: { title: string; deadline: string; importance: number };
    conflicts: LocalTask[];
  } | null>(null);
  const [editingTask, setEditingTask] = useState<LocalTask | null>(null);
  const [particleBursts, setParticleBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const particleIdRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio(taskDoneSound);

    const handleTaskDrop = async (e: Event) => {
      const event = e as CustomEvent<{ taskId: string; x: number; y: number }>;
      const taskId = event.detail.taskId;
      
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask || originalTask.status === "done") return;

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      const burstId = particleIdRef.current++;
      setParticleBursts(prev => [...prev, { id: burstId, x: event.detail.x, y: event.detail.y }]);

      const messages = [
        "Finally",
        "Could be faster",
        "Guess we're not in a hurry😑",
        "Good job, now let's get coffee☕️",
        "Well done, now coffee time"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      window.dispatchEvent(new CustomEvent("show-character-message", { detail: { message: randomMessage } }));

      await updateTask(taskId, { status: "done" });
      toast.success("Task completed!");
    };

    window.addEventListener("task-dropped", handleTaskDrop);

    return () => {
      window.removeEventListener("task-dropped", handleTaskDrop);
    };
  }, [tasks, updateTask]);


  const calculateSize = (deadline: string, importance: number): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysToDeadline = Math.max(
      1,
      Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    // Enhanced formula: base importance multiplied by urgency factor
    const urgencyFactor = Math.min(10, 30 / daysToDeadline);
    return (importance / 10) * urgencyFactor;
  };

  const handleAddTask = async (task: {
    title: string;
    deadline: string;
    importance: number;
  }) => {
    // Check if there's already a task with the same importance
    const conflictingTasks = tasks.filter((t) => t.importance === task.importance);
    
    if (conflictingTasks.length > 0) {
      setConflictDialog({ newTask: task, conflicts: conflictingTasks });
      return;
    }

    await insertTask(task);
  };

  const insertTask = async (task: { title: string; deadline: string; importance: number }) => {
    await createTask(task);
    toast.success("Task added");
  };



  
////////////////////////////
  const handleResolveConflict = async (makePriority: boolean) => {
    if (!conflictDialog) return;

    const { newTask } = conflictDialog;
    
    if (makePriority) {
      // Новая задача важнее - сдвигаем все конфликтующие задачи вниз (уменьшаем приоритет)
      for (const conflict of conflictDialog.conflicts) {
        await updateTask(conflict.id, { 
          importance: Math.max(1, conflict.importance - 1) 
        });
      }
      // Добавляем новую задачу с исходным приоритетом
      await insertTask(newTask);
    } else {
      // Новая задача менее важная - понижаем её приоритет
      const adjustedTask = {
        ...newTask,
        importance: Math.max(1, newTask.importance - 1),
      };
      await insertTask(adjustedTask);
    }
    
    setConflictDialog(null);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    toast.success("Task deleted");
  };

  const handleUpdateTask = async (
    id: string,
    updates: { title: string; deadline: string; importance: number }
  ) => {
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    // If importance changed, check for conflicts
    if (currentTask.importance !== updates.importance) {
      const conflictingTasks = tasks.filter(
        (t) => t.id !== id && t.importance === updates.importance
      );
      
      if (conflictingTasks.length > 0) {
        // Shift all tasks with importance >= new importance up by 1
        const tasksToUpdate = tasks
          .filter((t) => t.id !== id && t.importance >= updates.importance)
          .map((t) => ({
            id: t.id,
            importance: Math.min(10, t.importance + 1)
          }));
        
        for (const task of tasksToUpdate) {
          await updateTask(task.id, { importance: task.importance });
        }
      }
    }

    await updateTask(id, updates);
    toast.success("Task updated");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full gap-6 p-6">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <TaskSidebar onAdd={handleAddTask} />
        </div>
        
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-foreground">Task Map</h1>
                  <p className="text-muted-foreground">
                    Visualize your tasks by priority and deadline
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile task creation form */}
            <div className="md:hidden mb-6">
              <TaskSidebar onAdd={handleAddTask} />
            </div>

            <div className="flex flex-wrap gap-6 rounded-2xl border-2 border-border bg-muted/20 p-8">
              {tasks.length === 0 ? (
                <div className="flex w-full items-center justify-center py-20">
                  <p className="text-lg text-muted-foreground">
                    No tasks yet. Add your first task using the sidebar!
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskBlock
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    deadline={task.deadline}
                    importance={task.importance}
                    status={task.status}
                    syncState={task.syncState}
                    syncError={task.syncError}
                    size={calculateSize(task.deadline, task.importance)}
                    onClick={() => setEditingTask(task)}
                    onDelete={handleDeleteTask}
                    onRetry={() => retryFailedTask(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>


      <Dialog open={!!conflictDialog} onOpenChange={() => setConflictDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priority Conflict Detected</DialogTitle>
            <DialogDescription>
              Your new task has the same priority as existing tasks. Which one is more important?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-1">New task:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{conflictDialog?.newTask.title}</p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-1">Conflicts with:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {conflictDialog?.conflicts.map((task) => (
                  <p key={task.id} className="text-sm text-muted-foreground line-clamp-1">
                    • {task.title}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleResolveConflict(true)}
                className="flex-1"
              >
                <ArrowUp className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">More important</span>
              </Button>
              <Button
                onClick={() => handleResolveConflict(false)}
                variant="outline"
                className="flex-1"
              >
                <ArrowDown className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Less important</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskDialog
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdateTask}
      />

      {particleBursts.map((burst) => (
        <ParticleBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          onComplete={() => setParticleBursts(prev => prev.filter(b => b.id !== burst.id))}
        />
      ))}
    </SidebarProvider>
  );
};
