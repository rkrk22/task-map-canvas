import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskBlock } from "./TaskBlock";
import { TaskSidebar } from "./TaskSidebar";
import { EditTaskDialog } from "./EditTaskDialog";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface Task {
  id: string;
  title: string;
  deadline: string;
  importance: number;
}

export const TaskMap = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      // Shift all tasks with importance >= new task's importance up by 1
      const updates = tasks
        .filter((t) => t.importance >= task.importance)
        .map((t) => ({
          id: t.id,
          importance: Math.min(10, t.importance + 1)
        }));
      
      // Update all conflicting tasks
      for (const update of updates) {
        await supabase
          .from("tasks")
          .update({ importance: update.importance })
          .eq("id", update.id);
      }
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
    } else {
      toast.success("Task added");
    }
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
          await supabase
            .from("tasks")
            .update({ importance: task.importance })
            .eq("id", task.id);
        }
      }
    }

    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update task");
      console.error(error);
    } else {
      toast.success("Task updated");
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full gap-6 p-6">
        <TaskSidebar onAdd={handleAddTask} />
        
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-foreground">Task Map</h1>
              <p className="text-muted-foreground">
                Visualize your tasks by priority and deadline
              </p>
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
                    size={calculateSize(task.deadline, task.importance)}
                    onClick={() => setEditingTask(task)}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <EditTaskDialog
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdateTask}
      />
    </SidebarProvider>
  );
};
