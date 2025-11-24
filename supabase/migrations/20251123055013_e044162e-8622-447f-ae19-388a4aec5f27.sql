-- Create project_likes table
CREATE TABLE public.project_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_likes
CREATE POLICY "Anyone can view project likes"
ON public.project_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create likes"
ON public.project_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.project_likes
FOR DELETE
USING (auth.uid() = user_id);