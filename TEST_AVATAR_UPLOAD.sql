-- 프로필 이미지 업로드 테스트용 SQL
-- Supabase SQL Editor에서 실행하여 수동으로 테스트하세요

-- 1. 현재 사용자 확인
SELECT 
  'Current User' as info,
  auth.uid()::text as user_id;

-- 2. 현재 프로필 확인
SELECT 
  id,
  name,
  email,
  avatar_url,
  created_at
FROM public.profiles
WHERE id = auth.uid();

-- 3. 수동으로 avatar_url 업데이트 테스트 (실제 URL로 변경하세요)
-- UPDATE public.profiles
-- SET avatar_url = 'https://your-supabase-url.supabase.co/storage/v1/object/public/avatars/YOUR_USER_ID/YOUR_FILE.webp'
-- WHERE id = auth.uid()
-- RETURNING id, name, email, avatar_url;

-- 4. 업데이트 후 확인
-- SELECT id, name, email, avatar_url
-- FROM public.profiles
-- WHERE id = auth.uid();

