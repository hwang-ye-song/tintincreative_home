-- Fix search_path for increment_project_view_count function
CREATE OR REPLACE FUNCTION public.increment_project_view_count(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.projects
  SET view_count = view_count + 1
  WHERE id = project_id;
END;
$$;