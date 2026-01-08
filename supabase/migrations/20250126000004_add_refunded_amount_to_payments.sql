-- 부분 환불 금액을 저장하기 위한 컬럼 추가

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC DEFAULT NULL;

-- 부분 환불 금액이 있으면 전체 환불 금액보다 작아야 함
-- (이 체크는 애플리케이션 레벨에서 처리)

