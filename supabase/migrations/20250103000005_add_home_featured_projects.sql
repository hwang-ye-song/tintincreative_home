-- 홈페이지에 표시할 프로젝트를 지정하는 필드 추가
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_featured_home BOOLEAN DEFAULT FALSE;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_featured_home ON public.projects(is_featured_home) WHERE is_featured_home = true;

