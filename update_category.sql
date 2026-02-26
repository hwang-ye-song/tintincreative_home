-- 1. profiles 테이블에 student_type 컬럼 추가 (기본값 '중등')
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_type text DEFAULT '중등';

-- 기존 계정의 student_type을 '중등'으로 일괄 업데이트 (만약 NULL인 경우)
UPDATE public.profiles SET student_type = '중등' WHERE student_type IS NULL;

-- 2. projects 테이블에 sub_category 컬럼 추가 (기본값 '중등')
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sub_category text DEFAULT '중등';

-- 기존 프로젝트의 sub_category를 '중등'으로 일괄 업데이트 (만약 NULL인 경우)
UPDATE public.projects SET sub_category = '중등' WHERE sub_category IS NULL;
