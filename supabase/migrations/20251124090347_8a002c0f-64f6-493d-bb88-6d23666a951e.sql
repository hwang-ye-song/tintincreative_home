-- Add view_count column to projects table
ALTER TABLE public.projects 
ADD COLUMN view_count integer DEFAULT 0 NOT NULL;

-- Create index on view_count for efficient sorting
CREATE INDEX idx_projects_view_count ON public.projects(view_count DESC);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_project_view_count(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.projects
  SET view_count = view_count + 1
  WHERE id = project_id;
END;
$$;