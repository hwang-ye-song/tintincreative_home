-- Fix payments table: make payment_key nullable for pending payments
-- 결제 승인 전에는 payment_key가 없을 수 있으므로 NULL 허용으로 변경

-- 먼저 기존 UNIQUE 제약조건 제거
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_payment_key_key;

-- payment_key를 NULL 허용으로 변경
ALTER TABLE public.payments
ALTER COLUMN payment_key DROP NOT NULL;

-- NULL이 아닌 payment_key에 대해서만 UNIQUE 제약조건 추가
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_key_unique 
  ON public.payments (payment_key) 
  WHERE payment_key IS NOT NULL;

-- 빈 문자열을 NULL로 변환
UPDATE public.payments
SET payment_key = NULL
WHERE payment_key = '' OR payment_key LIKE 'temp_%';

