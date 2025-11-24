-- profiles 테이블의 UPDATE RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- UPDATE 정책 재생성 (WITH CHECK 절 포함)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK 있음'
    ELSE '⚠️ WITH CHECK 없음'
  END as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
  AND cmd = 'UPDATE';

