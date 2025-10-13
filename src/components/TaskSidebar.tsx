import { Plus } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarTrigger } from "@/components/ui/sidebar";
import { AddTaskForm } from "./AddTaskForm";
interface TaskSidebarProps {
  onAdd: (task: {
    title: string;
    deadline: string;
    importance: number;
  }) => void;
}
export function TaskSidebar({
  onAdd
}: TaskSidebarProps) {
  return <Sidebar className="w-80 border-border" collapsible="none">
      
      
      <SidebarContent>
        <SidebarGroup className="mx-0 px-[22px]">
          <SidebarGroupLabel>New Task</SidebarGroupLabel>
          <SidebarGroupContent>
            <AddTaskForm onAdd={onAdd} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}