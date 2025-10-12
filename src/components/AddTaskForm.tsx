// сверху: import { supabase } from "@/lib/supabase";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title.trim()) {
    toast.error("Please enter a task title");
    return;
  }
  const payload = {
    title,
    deadline: format(date, "yyyy-MM-dd"),
    importance,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select()
    .single();

  if (error) {
    toast.error("Supabase: " + error.message);
    return;
  }

  onAdd?.(data); // передаём созданную запись, а не payload
  setTitle("");
  setDate(new Date());
  setImportance(5);
  toast.success("Task added to Supabase");
};
