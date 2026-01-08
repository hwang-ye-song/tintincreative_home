-- 관리자/선생님이 다른 사용자의 역할을 변경할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins and teachers can update user roles"
  ON public.profiles FOR UPDATE
  USING (
    -- 자신의 프로필이거나
    auth.uid() = id OR
    -- 관리자 또는 선생님인 경우
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    -- 자신의 프로필이거나
    auth.uid() = id OR
    -- 관리자 또는 선생님인 경우
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

