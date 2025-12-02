ALTER TABLE public.project_comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE;

