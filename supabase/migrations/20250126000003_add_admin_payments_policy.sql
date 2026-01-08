-- 관리자가 모든 결제 정보를 볼 수 있도록 RLS 정책 추가

-- 기존 정책은 유지하고, 관리자용 정책 추가
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- 관리자는 모든 결제 정보를 볼 수 있음
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'teacher')
    )
  );

