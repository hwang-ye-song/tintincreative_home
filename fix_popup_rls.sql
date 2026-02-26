-- 팝업 설정 RLS 정책 재생성 및 수정
-- 이 파일을 Supabase SQL Editor에서 실행하세요.

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can insert popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can update popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can delete popup_settings" ON public.popup_settings;

-- SELECT 정책: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view popup_settings"
  ON public.popup_settings
  FOR SELECT
  USING (true);

-- INSERT 정책: 관리자만 삽입 가능
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

-- UPDATE 정책: 관리자만 수정 가능
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

-- DELETE 정책: 관리자만 삭제 가능
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

