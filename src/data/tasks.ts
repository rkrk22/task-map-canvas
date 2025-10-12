import { supabase } from "@/lib/supabase";

export async function loadTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("priority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertTasks(tasks: any[]) {
  const { error } = await supabase
    .from("tasks")
    .upsert(tasks, { onConflict: "id" });
  if (error) throw error;
}
