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
      
      
      <SidebarContent className="bg-[VITE_N8N_WEBHOOK_URL=\"https://n8n-my35.onrender.com/webhook/assistant-bubble\"_VITE_SUPABASE_PROJECT_ID=\"pbinxjbfpidijbadbcuh\"_VITE_SUPABASE_PUBLISHABLE_KEY=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaW54amJmcGlkaWpiYWRiY3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTY5ODEsImV4cCI6MjA3NTc3Mjk4MX0.BiMCzimTUPaWCWc3CsKlyAfZ7HgiAEdn4o8Ko-lvbTU\"_VITE_SUPABASE_URL=\"https://pbinxjbfpidijbadbcuh.supabase.co\"] bg-[#fcf6ed]">
        <SidebarGroup className="mx-0 px-[22px]">
          <SidebarGroupLabel>New Task</SidebarGroupLabel>
          <SidebarGroupContent>
            <AddTaskForm onAdd={onAdd} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}