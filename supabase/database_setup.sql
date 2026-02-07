-- ============================================================================
-- 틴틴 AI 로봇 아카데미 - 데이터베이스 전체 설정 스크립트
-- ============================================================================
-- 이 파일은 Supabase 대시보드의 SQL Editor에서 실행하세요.
-- 모든 마이그레이션을 시간순으로 통합한 파일입니다.
-- ============================================================================

-- ============================================================================
-- 1. 기본 테이블 생성 (2025-11-17)
-- ============================================================================

-- 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 코스 테이블 생성
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 코스 정책 (공개 읽기)
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- 수강 테이블 생성
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  curriculum_id TEXT REFERENCES public.curriculums(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 수강 정책
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can enroll in courses or curriculums" ON public.enrollments;
CREATE POLICY "Users can enroll in courses or curriculums"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 프로젝트 테이블 생성
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  video_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_best BOOLEAN DEFAULT FALSE,
  is_featured_home BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 프로젝트 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_attachments ON public.projects USING GIN (attachments);
CREATE INDEX IF NOT EXISTS idx_projects_is_best ON public.projects (is_best);
CREATE INDEX IF NOT EXISTS idx_projects_featured_home ON public.projects(is_featured_home) WHERE is_featured_home = true;
CREATE INDEX IF NOT EXISTS idx_projects_is_hidden ON public.projects (is_hidden);

-- RLS 활성화
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 프로젝트 정책
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all projects" ON public.projects;
CREATE POLICY "Admins can update all projects"
  ON public.projects
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- 프로젝트 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 프로젝트 댓글 인덱스
CREATE INDEX IF NOT EXISTS idx_project_comments_is_hidden ON public.project_comments (is_hidden);

-- RLS 활성화
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- 프로젝트 댓글 정책
DROP POLICY IF EXISTS "Anyone can view project comments" ON public.project_comments;
CREATE POLICY "Anyone can view project comments"
  ON public.project_comments
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.project_comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.project_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.project_comments;
CREATE POLICY "Users can update their own comments"
  ON public.project_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.project_comments;
CREATE POLICY "Users can delete their own comments"
  ON public.project_comments
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update comment visibility" ON public.project_comments;
CREATE POLICY "Admins can update comment visibility"
  ON public.project_comments
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 댓글 좋아요 테이블 생성
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.project_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- 2. 스토리지 버킷 및 정책 설정 (2025-11-17)
-- ============================================================================

-- 프로젝트 이미지 스토리지 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 프로젝트 이미지 스토리지 정책
DROP POLICY IF EXISTS "Anyone can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;

CREATE POLICY "Anyone can view project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 관리자는 popup 폴더에 이미지 업로드 가능
DROP POLICY IF EXISTS "Admins can upload popup images" ON storage.objects;
CREATE POLICY "Admins can upload popup images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = 'popup'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own project images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 관리자는 popup 폴더의 이미지 업데이트 가능
DROP POLICY IF EXISTS "Admins can update popup images" ON storage.objects;
CREATE POLICY "Admins can update popup images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = 'popup'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own project images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 관리자는 popup 폴더의 이미지 삭제 가능
DROP POLICY IF EXISTS "Admins can delete popup images" ON storage.objects;
CREATE POLICY "Admins can delete popup images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = 'popup'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 프로젝트 파일 스토리지 버킷 (비디오, 문서 등)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- 프로젝트 파일 스토리지 정책
DROP POLICY IF EXISTS "Anyone can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project files" ON storage.objects;

CREATE POLICY "Anyone can view project files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-files');

CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own project files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own project files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 3. 사용자 프로필 자동 생성 함수 (2025-11-17)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- 사용자 가입 시 프로필 자동 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. 관리자 및 커리큘럼 기능 (2025-01-01)
-- ============================================================================

-- 프로필에 역할 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student'));

-- 프로필에 아바타 URL 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 프로필 업데이트 정책 수정
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 아바타 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 아바타 스토리지 정책
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 커리큘럼 테이블 생성
CREATE TABLE IF NOT EXISTS public.curriculums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  students TEXT NOT NULL,
  price NUMERIC,
  tracks JSONB NOT NULL,
  media_assets JSONB NOT NULL,
  projects_section_badge TEXT DEFAULT 'Student Projects',
  projects_section_title TEXT DEFAULT '관련 학생 프로젝트',
  projects_section_description TEXT DEFAULT '이 커리큘럼을 수강한 학생들의 프로젝트를 확인해보세요',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;

-- 커리큘럼 정책
DROP POLICY IF EXISTS "Anyone can view curriculums" ON public.curriculums;
CREATE POLICY "Anyone can view curriculums"
  ON public.curriculums
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert curriculums" ON public.curriculums;
CREATE POLICY "Only admins can insert curriculums"
  ON public.curriculums
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update curriculums" ON public.curriculums;
CREATE POLICY "Only admins can update curriculums"
  ON public.curriculums
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete curriculums" ON public.curriculums;
CREATE POLICY "Only admins can delete curriculums"
  ON public.curriculums
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 커리큘럼-프로젝트 연결 테이블
CREATE TABLE IF NOT EXISTS public.curriculum_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(curriculum_id, project_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_curriculum_projects_curriculum_id ON public.curriculum_projects(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_projects_project_id ON public.curriculum_projects(project_id);

-- RLS 활성화
ALTER TABLE public.curriculum_projects ENABLE ROW LEVEL SECURITY;

-- 커리큘럼-프로젝트 정책
DROP POLICY IF EXISTS "Anyone can view curriculum_projects" ON public.curriculum_projects;
CREATE POLICY "Anyone can view curriculum_projects"
  ON public.curriculum_projects
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert curriculum_projects" ON public.curriculum_projects;
CREATE POLICY "Only admins can insert curriculum_projects"
  ON public.curriculum_projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update curriculum_projects" ON public.curriculum_projects;
CREATE POLICY "Only admins can update curriculum_projects"
  ON public.curriculum_projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete curriculum_projects" ON public.curriculum_projects;
CREATE POLICY "Only admins can delete curriculum_projects"
  ON public.curriculum_projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 커리큘럼 updated_at 트리거
DROP TRIGGER IF EXISTS update_curriculums_updated_at ON public.curriculums;
CREATE TRIGGER update_curriculums_updated_at
  BEFORE UPDATE ON public.curriculums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 수강 테이블에 커리큘럼 지원 추가
ALTER TABLE public.enrollments
  DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;

ALTER TABLE public.enrollments
  ALTER COLUMN course_id DROP NOT NULL;

ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.enrollments
  DROP CONSTRAINT IF EXISTS enrollments_must_have_course_or_curriculum;

ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_must_have_course_or_curriculum 
    CHECK (course_id IS NOT NULL OR curriculum_id IS NOT NULL);

DROP INDEX IF EXISTS enrollments_user_id_course_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique 
  ON public.enrollments (user_id, course_id) 
  WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_curriculum_unique 
  ON public.enrollments (user_id, curriculum_id) 
  WHERE curriculum_id IS NOT NULL;

-- ============================================================================
-- 5. 결제 시스템 (2025-01-26)
-- ============================================================================

-- 결제 테이블 생성
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  curriculum_id TEXT REFERENCES public.curriculums(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_key TEXT UNIQUE,
  order_id TEXT NOT NULL UNIQUE,
  payment_method TEXT,
  refunded_amount NUMERIC DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_curriculum_id ON public.payments (curriculum_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON public.payments (course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON public.payments (payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_key_unique 
  ON public.payments (payment_key) 
  WHERE payment_key IS NOT NULL;

-- RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 결제 정책
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE
  USING (true);

-- 결제 updated_at 트리거
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- ============================================================================
-- 6. 커리큘럼 설정 (2025-01-27)
-- ============================================================================

-- 커리큘럼 설정 테이블 생성
CREATE TABLE IF NOT EXISTS public.curriculum_settings (
  id TEXT PRIMARY KEY,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.curriculum_settings ENABLE ROW LEVEL SECURITY;

-- 커리큘럼 설정 정책
DROP POLICY IF EXISTS "Anyone can view curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can insert curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can update curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can delete curriculum_settings" ON public.curriculum_settings;

CREATE POLICY "Anyone can view curriculum_settings"
  ON public.curriculum_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert curriculum_settings"
  ON public.curriculum_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update curriculum_settings"
  ON public.curriculum_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete curriculum_settings"
  ON public.curriculum_settings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 커리큘럼 설정 updated_at 트리거
DROP TRIGGER IF EXISTS update_curriculum_settings_updated_at ON public.curriculum_settings;
CREATE TRIGGER update_curriculum_settings_updated_at
  BEFORE UPDATE ON public.curriculum_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. 팝업 설정 (2025-01-28)
-- ============================================================================

-- 팝업 설정 테이블 생성
CREATE TABLE IF NOT EXISTS public.popup_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  is_enabled BOOLEAN DEFAULT false,
  title TEXT,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT '자세히 보기',
  show_once_per_session BOOLEAN DEFAULT true,
  max_width TEXT DEFAULT '100px',
  max_height TEXT DEFAULT '100px',
  position TEXT DEFAULT 'center',
  priority INTEGER DEFAULT 1000,
  top_offset TEXT DEFAULT '50%',
  left_offset TEXT DEFAULT '50%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

-- 팝업 설정 정책
DROP POLICY IF EXISTS "Anyone can view popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can insert popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can update popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can delete popup_settings" ON public.popup_settings;

CREATE POLICY "Anyone can view popup_settings"
  ON public.popup_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert popup_settings"
  ON public.popup_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update popup_settings"
  ON public.popup_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete popup_settings"
  ON public.popup_settings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 팝업 설정 updated_at 트리거
DROP TRIGGER IF EXISTS update_popup_settings_updated_at ON public.popup_settings;
CREATE TRIGGER update_popup_settings_updated_at
  BEFORE UPDATE ON public.popup_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 기본 팝업 설정 삽입
INSERT INTO public.popup_settings (id, is_enabled, title, content, max_width, max_height, position, top_offset, left_offset)
VALUES ('main', false, '환영합니다!', '새로운 소식을 확인해보세요.', '100px', '100px', 'center', '50%', '50%')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 완료!
-- ============================================================================
-- 모든 마이그레이션이 완료되었습니다.
-- 이제 관리자 계정을 생성하려면 Supabase 대시보드에서:
-- 1. Authentication > Users > Add user
-- 2. Email: admin@admin.com, Password: 원하는 비밀번호
-- 3. Auto Confirm User 체크
-- 4. 다음 SQL 실행:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@admin.com';
-- ============================================================================

