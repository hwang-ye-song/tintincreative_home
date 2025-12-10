-- 관리자가 모든 프로젝트를 수정할 수 있도록 RLS 정책 추가
-- 기존 "Users can update their own projects" 정책과 함께 작동 (OR 조건)

-- 기존 정책 확인 및 수정
-- "Admins can update project visibility" 정책이 있으면 삭제하고 더 포괄적인 정책으로 교체
DROP POLICY IF EXISTS "Admins can update project visibility" ON public.projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON public.projects;

-- 관리자는 모든 프로젝트의 모든 필드를 수정할 수 있음
CREATE POLICY "Admins can update all projects"
ON public.projects
FOR UPDATE
USING (
  -- 작성자이거나 관리자인 경우
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  -- 작성자이거나 관리자인 경우
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

