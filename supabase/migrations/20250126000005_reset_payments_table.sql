-- 결제 내역 테이블 초기화
-- 주의: 이 스크립트는 payments 테이블의 모든 데이터를 삭제합니다.
-- 실행 전에 백업을 권장합니다.

-- 1. 외래 키 제약 조건 확인을 위해 관련 데이터 먼저 확인
-- enrollments 테이블의 데이터는 payments와 연결되어 있을 수 있으므로 확인 필요

-- 2. payments 테이블의 모든 데이터 삭제
TRUNCATE TABLE public.payments CASCADE;

-- 또는 특정 조건으로 삭제하려면:
-- DELETE FROM public.payments;

-- 3. 시퀀스 리셋 (UUID를 사용하므로 필요 없지만, 다른 ID 타입을 사용한다면 필요)
-- ALTER SEQUENCE IF EXISTS public.payments_id_seq RESTART WITH 1;

-- 확인: 테이블이 비어있는지 확인
-- SELECT COUNT(*) FROM public.payments; -- 결과가 0이어야 함

