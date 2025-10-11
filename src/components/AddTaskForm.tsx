import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddTaskFormProps {
  onAdd: (task: { title: string; deadline: string; importance: number }) => void;
}

export const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    
    if (!deadline) {
      toast.error("Please select a deadline");
      return;
    }

    onAdd({ title, deadline, importance });
    setTitle("");
    setDeadline("");
    setImportance(5);
    toast.success("Task added successfully!");
  };

  return (
    <Card className="mb-8 border-2 bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            placeholder="Enter task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="importance">
              Importance: {importance}/10
            </Label>
            <Input
              id="importance"
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="cursor-pointer"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </form>
    </Card>
  );
};
