-- 프로필 이미지 기능 문제 해결 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. avatar_url 컬럼 추가 (없는 경우)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 프로필 업데이트 정책 확인 및 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 프로필 업데이트 정책 재생성 (WITH CHECK 절 포함)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. avatars 스토리지 버킷 생성 (없는 경우)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. 스토리지 정책 삭제 및 재생성
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- 모든 사용자가 아바타 이미지를 볼 수 있음
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- 인증된 사용자만 자신의 아바타를 업로드할 수 있음
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 사용자는 자신의 아바타를 업데이트할 수 있음
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자는 자신의 아바타를 삭제할 수 있음
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 확인 쿼리
-- 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'avatar_url';

-- 정책 확인
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE';

-- 버킷 확인
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'avatars';

