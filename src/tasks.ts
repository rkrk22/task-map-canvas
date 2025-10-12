// пример: src/data/tasks.ts
import { supabase } from "@/lib/supabase";

export async function loadTasks() {
  const { data, error } = await supabase.from("tasks").select("*").order("priority", { ascending:false });
  if (error) throw error;
  return data ?? [];
}
