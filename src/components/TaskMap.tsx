import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskBlock } from "./TaskBlock";
import { AddTaskForm } from "./AddTaskForm";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Task {
  id: string;
  title: string;
  deadline: string;
  importance: number;
}

export const TaskMap = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conflictDialog, setConflictDialog] = useState<{
    newTask: { title: string; deadline: string; importance: number };
    conflicts: Task[];
  } | null>(null);

  useEffect(() => {
    fetchTasks();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load tasks");
      console.error(error);
      return;
    }

    setTasks(data || []);
  };

  const calculateSize = (deadline: string, importance: number): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysToDeadline = Math.max(
      1,
      Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    return importance * (1 / daysToDeadline);
  };

  const handleAddTask = async (task: {
    title: string;
    deadline: string;
    importance: number;
  }) => {
    const newSize = calculateSize(task.deadline, task.importance);
    
    // Check for conflicts (tasks with similar size ±0.05)
    const conflicts = tasks.filter((t) => {
      const taskSize = calculateSize(t.deadline, t.importance);
      return Math.abs(taskSize - newSize) < 0.05;
    });

    if (conflicts.length > 0) {
      setConflictDialog({ newTask: task, conflicts });
      return;
    }

    await insertTask(task);
  };

  const insertTask = async (task: {
    title: string;
    deadline: string;
    importance: number;
  }) => {
    const { error } = await supabase.from("tasks").insert([task]);

    if (error) {
      toast.error("Failed to add task");
      console.error(error);
    }
  };

  const handleResolveConflict = async (makePriority: boolean) => {
    if (!conflictDialog) return;

    const { newTask } = conflictDialog;
    const adjustedTask = {
      ...newTask,
      importance: makePriority 
        ? Math.min(10, newTask.importance + 0.1)
        : Math.max(1, newTask.importance - 0.1),
    };

    await insertTask(adjustedTask);
    setConflictDialog(null);
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete task");
      console.error(error);
    } else {
      toast.success("Task deleted");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Task Map</h1>
          <p className="text-muted-foreground">
            Visualize your tasks by priority and deadline
          </p>
        </div>

        <AddTaskForm onAdd={handleAddTask} />

        <div className="flex flex-wrap gap-6 rounded-2xl border-2 border-border bg-muted/20 p-8">
          {tasks.length === 0 ? (
            <div className="flex w-full items-center justify-center py-20">
              <p className="text-lg text-muted-foreground">
                No tasks yet. Add your first task above!
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
                size={calculateSize(task.deadline, task.importance)}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
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
              <p className="font-semibold">New task:</p>
              <p className="text-sm text-muted-foreground">{conflictDialog?.newTask.title}</p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold">Conflicts with:</p>
              {conflictDialog?.conflicts.map((task) => (
                <p key={task.id} className="text-sm text-muted-foreground">
                  • {task.title}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleResolveConflict(true)}
                className="flex-1"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                New task is MORE important
              </Button>
              <Button
                onClick={() => handleResolveConflict(false)}
                variant="outline"
                className="flex-1"
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                New task is LESS important
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
