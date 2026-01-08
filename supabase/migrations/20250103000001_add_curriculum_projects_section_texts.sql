-- Add projects section text fields to curriculums table
ALTER TABLE public.curriculums 
ADD COLUMN IF NOT EXISTS projects_section_badge TEXT DEFAULT 'Student Projects',
ADD COLUMN IF NOT EXISTS projects_section_title TEXT DEFAULT '관련 학생 프로젝트',
ADD COLUMN IF NOT EXISTS projects_section_description TEXT DEFAULT '이 커리큘럼을 수강한 학생들의 프로젝트를 확인해보세요';

