-- 회원가입한 사용자 확인 및 프로필 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. auth.users 테이블에서 최근 가입한 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. profiles 테이블에서 프로필 확인
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. 프로필이 없는 사용자 찾기
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. 프로필이 없는 사용자에게 프로필 생성
-- (위 쿼리 결과를 보고 필요한 사용자만 생성)
INSERT INTO public.profiles (id, email, name, role, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', '사용자'),
  'student',
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. 확인: 프로필이 생성되었는지 확인
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

