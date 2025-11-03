-- Fix search_path for increment_task_version function
DROP TRIGGER IF EXISTS task_version_increment ON tasks;
DROP FUNCTION IF EXISTS increment_task_version();

CREATE OR REPLACE FUNCTION increment_task_version()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_version_increment
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION increment_task_version();