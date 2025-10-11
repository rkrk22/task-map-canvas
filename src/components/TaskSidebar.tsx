import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AddTaskForm } from "./AddTaskForm";

interface TaskSidebarProps {
  onAdd: (task: { title: string; deadline: string; importance: number }) => void;
}

export function TaskSidebar({ onAdd }: TaskSidebarProps) {
  return (
    <Sidebar className="w-80 border-border" collapsible="none">
      <div className="flex items-center gap-2 p-4 border-b">
        <Plus className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Add Task</h2>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>New Task</SidebarGroupLabel>
          <SidebarGroupContent>
            <AddTaskForm onAdd={onAdd} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
