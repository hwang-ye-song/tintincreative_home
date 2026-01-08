-- Create curriculum_projects table to link curriculums with projects
CREATE TABLE IF NOT EXISTS public.curriculum_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(curriculum_id, project_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_curriculum_projects_curriculum_id ON public.curriculum_projects(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_projects_project_id ON public.curriculum_projects(project_id);

-- Enable RLS on curriculum_projects
ALTER TABLE public.curriculum_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for curriculum_projects
CREATE POLICY "Anyone can view curriculum_projects"
ON public.curriculum_projects
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert curriculum_projects"
ON public.curriculum_projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update curriculum_projects"
ON public.curriculum_projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete curriculum_projects"
ON public.curriculum_projects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

