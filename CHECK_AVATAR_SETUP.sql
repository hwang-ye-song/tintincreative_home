-- 프로필 이미지 기능 설정 확인 스크립트
-- Supabase SQL Editor에서 실행하여 현재 상태를 확인하세요

-- 1. profiles 테이블에 avatar_url 컬럼이 있는지 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'avatar_url';

-- 2. profiles 테이블의 UPDATE RLS 정책 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
  AND cmd = 'UPDATE';

-- 3. avatars 스토리지 버킷 확인
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id = 'avatars';

-- 4. avatars 버킷의 RLS 정책 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%avatar%';

-- 5. 현재 사용자의 프로필 확인
SELECT 
  id,
  name,
  email,
  avatar_url,
  created_at
FROM public.profiles
WHERE id = auth.uid();

