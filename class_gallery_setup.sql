-- ============================================================================
-- 틴틴 AI 로봇 아카데미 - 수업 스케치(class_gallery) 테이블 및 권한 설정
-- ============================================================================
-- 이 파일은 Supabase 대시보드의 SQL Editor에서 복사하여 실행하세요.

-- 1. class_gallery 테이블 생성
CREATE TABLE IF NOT EXISTS public.class_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  is_video BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_class_gallery_is_hidden ON public.class_gallery (is_hidden);
CREATE INDEX IF NOT EXISTS idx_class_gallery_created_at ON public.class_gallery (created_at DESC);

-- RLS 활성화
ALTER TABLE public.class_gallery ENABLE ROW LEVEL SECURITY;

-- 정책 1: 누구나 보기 가능 (숨겨진 게시물 제외)
DROP POLICY IF EXISTS "Anyone can view class gallery" ON public.class_gallery;
CREATE POLICY "Anyone can view class gallery"
  ON public.class_gallery FOR SELECT
  USING (is_hidden = false OR auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    ));

-- 정책 2: 관리자 또는 선생님만 작성 가능
DROP POLICY IF EXISTS "Admins and teachers can insert to class gallery" ON public.class_gallery;
CREATE POLICY "Admins and teachers can insert to class gallery"
  ON public.class_gallery FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 정책 3: 작성자이거나 관리자/선생님일 경우 수정 가능
DROP POLICY IF EXISTS "Authors, Admins and teachers can update class gallery" ON public.class_gallery;
CREATE POLICY "Authors, Admins and teachers can update class gallery"
  ON public.class_gallery FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 정책 4: 작성자이거나 관리자/선생님일 경우 삭제 가능
DROP POLICY IF EXISTS "Authors, Admins and teachers can delete class gallery" ON public.class_gallery;
CREATE POLICY "Authors, Admins and teachers can delete class gallery"
  ON public.class_gallery FOR DELETE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- updated_at 트리거 연결
DROP TRIGGER IF EXISTS update_class_gallery_updated_at ON public.class_gallery;
CREATE TRIGGER update_class_gallery_updated_at
  BEFORE UPDATE ON public.class_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 2. 스토리지 버킷 및 정책 설정 (gallery-media)
-- ============================================================================

-- gallery-media 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-media', 'gallery-media', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 이미지/비디오 보기 가능
DROP POLICY IF EXISTS "Anyone can view gallery media" ON storage.objects;
CREATE POLICY "Anyone can view gallery media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-media');

-- 관리자 및 선생님만 업로드 가능
DROP POLICY IF EXISTS "Admins and teachers can upload gallery media" ON storage.objects;
CREATE POLICY "Admins and teachers can upload gallery media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-media' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 관리자 및 선생님만 삭제 가능
DROP POLICY IF EXISTS "Admins and teachers can delete gallery media" ON storage.objects;
CREATE POLICY "Admins and teachers can delete gallery media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gallery-media' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

-- 권한자(관리자, 선생님) 업데이트 가능
DROP POLICY IF EXISTS "Admins and teachers can update gallery media" ON storage.objects;
CREATE POLICY "Admins and teachers can update gallery media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gallery-media' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );
