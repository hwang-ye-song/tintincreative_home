-- profiles 테이블의 RLS 정책 확인
-- Supabase SQL Editor에서 실행하세요

-- 1. profiles 테이블의 모든 RLS 정책 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY cmd, policyname;

-- 2. 특히 UPDATE 정책 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check,
  CASE 
    WHEN cmd = 'UPDATE' AND with_check IS NULL THEN '⚠️ WITH CHECK가 없습니다!'
    WHEN cmd = 'UPDATE' AND with_check IS NOT NULL THEN '✅ 정상'
    ELSE 'N/A'
  END as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
  AND cmd = 'UPDATE';

-- 3. 현재 사용자 확인
SELECT 
  'Current User ID' as info,
  auth.uid()::text as value;

-- 4. 현재 사용자의 프로필 확인
SELECT 
  id,
  name,
  email,
  avatar_url,
  created_at
FROM public.profiles
WHERE id = auth.uid();

