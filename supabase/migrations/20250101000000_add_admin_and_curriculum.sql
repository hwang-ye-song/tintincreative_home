-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'));

-- Add is_hidden column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Add is_hidden column to project_comments table
ALTER TABLE public.project_comments 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Create curriculums table
CREATE TABLE IF NOT EXISTS public.curriculums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  students TEXT NOT NULL,
  price NUMERIC,
  tracks JSONB NOT NULL,
  media_assets JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on curriculums
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;

-- RLS policies for curriculums
CREATE POLICY "Anyone can view curriculums"
ON public.curriculums
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert curriculums"
ON public.curriculums
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update curriculums"
ON public.curriculums
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete curriculums"
ON public.curriculums
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_curriculums_updated_at
BEFORE UPDATE ON public.curriculums
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for projects (admins can hide/unhide)
CREATE POLICY "Admins can update project visibility"
ON public.projects
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS policies for project_comments (admins can hide/unhide)
CREATE POLICY "Admins can update comment visibility"
ON public.project_comments
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

