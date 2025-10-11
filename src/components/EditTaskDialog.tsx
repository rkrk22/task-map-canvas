import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditTaskDialogProps {
  task: {
    id: string;
    title: string;
    deadline: string;
    importance: number;
  } | null;
  onClose: () => void;
  onUpdate: (id: string, updates: { title: string; deadline: string; importance: number }) => void;
}

export const EditTaskDialog = ({ task, onClose, onUpdate }: EditTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState(5);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDeadline(task.deadline);
      setImportance(task.importance);
    }
  }, [task]);

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

    if (task) {
      onUpdate(task.id, { title, deadline, importance });
      onClose();
      toast.success("Task updated");
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details and priority
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div>
            <Label htmlFor="edit-deadline">Deadline</Label>
            <Input
              id="edit-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="edit-importance">
              Importance: {importance}/10
            </Label>
            <Input
              id="edit-importance"
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="cursor-pointer"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
