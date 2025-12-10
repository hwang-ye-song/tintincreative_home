-- Add is_best flag to highlight best projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_best BOOLEAN DEFAULT FALSE;

-- Helpful index for querying best projects
CREATE INDEX IF NOT EXISTS idx_projects_is_best ON public.projects (is_best);

