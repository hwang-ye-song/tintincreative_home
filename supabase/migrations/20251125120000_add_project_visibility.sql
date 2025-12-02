-- Add visibility flags to projects and project_comments
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.project_comments
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Ensure existing rows are initialized
UPDATE public.projects SET is_hidden = COALESCE(is_hidden, false);
UPDATE public.project_comments SET is_hidden = COALESCE(is_hidden, false);

-- Helpful indexes for common filters
CREATE INDEX IF NOT EXISTS idx_projects_is_hidden ON public.projects (is_hidden);
CREATE INDEX IF NOT EXISTS idx_project_comments_is_hidden ON public.project_comments (is_hidden);

  