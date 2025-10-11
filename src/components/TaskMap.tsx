import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskBlock } from "./TaskBlock";
import { AddTaskForm } from "./AddTaskForm";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  deadline: string;
  importance: number;
}

export const TaskMap = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
    const { error } = await supabase.from("tasks").insert([task]);

    if (error) {
      toast.error("Failed to add task");
      console.error(error);
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
    </div>
  );
};
