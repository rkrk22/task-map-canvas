-- Create task_table with same structure as tasks
CREATE TABLE public.task_table (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  deadline date NOT NULL,
  importance integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_table ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (same as tasks table)
CREATE POLICY "Allow all operations on task_table"
ON public.task_table
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_table_updated_at
BEFORE UPDATE ON public.task_table
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Copy all data from tasks to task_table
INSERT INTO public.task_table (id, title, deadline, importance, created_at, updated_at)
SELECT id, title, deadline, importance, created_at, updated_at
FROM public.tasks;