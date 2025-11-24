-- 프로필 INSERT RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 기존 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

-- 새로운 INSERT 정책 생성 (트리거와 수동 생성 모두 허용)
-- 1. 트리거가 작동하도록 하는 정책 (SECURITY DEFINER 함수는 service_role로 실행)
CREATE POLICY "Allow profile creation for new users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- 또는 더 안전하게: 자신의 프로필만 생성 가능
-- CREATE POLICY "Users can insert own profile"
--   ON public.profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);

-- 확인: 정책이 제대로 생성되었는지 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

