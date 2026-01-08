# 결제 내역 테이블 초기화 가이드

## ⚠️ 주의사항
이 작업은 **모든 결제 내역 데이터를 영구적으로 삭제**합니다. 실행 전에 반드시 백업을 권장합니다.

## 방법 1: Supabase 대시보드에서 실행 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택: `aufvgzuokvttpguslkwm`

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭
   - **New query** 클릭

3. **SQL 스크립트 실행**
   ```sql
   -- 결제 내역 테이블의 모든 데이터 삭제
   TRUNCATE TABLE public.payments CASCADE;
   ```

4. **실행 확인**
   - 실행 후 다음 쿼리로 확인:
   ```sql
   SELECT COUNT(*) FROM public.payments;
   ```
   - 결과가 `0`이면 성공입니다.

## 방법 2: 마이그레이션 파일 사용

프로젝트에 마이그레이션 파일이 생성되었습니다:
- `supabase/migrations/20250126000005_reset_payments_table.sql`

이 파일을 Supabase SQL Editor에서 실행하거나, Supabase CLI를 사용하여 적용할 수 있습니다.

## 방법 3: 특정 조건으로 삭제

모든 데이터가 아닌 특정 조건의 데이터만 삭제하려면:

```sql
-- 예: 특정 날짜 이전 데이터 삭제
DELETE FROM public.payments 
WHERE created_at < '2025-01-01';

-- 예: 실패한 결제만 삭제
DELETE FROM public.payments 
WHERE status = 'failed';

-- 예: 특정 사용자의 결제 내역만 삭제
DELETE FROM public.payments 
WHERE user_id = 'user-uuid-here';
```

## 데이터 백업 (선택사항)

삭제 전에 데이터를 백업하려면:

```sql
-- CSV로 내보내기
COPY (
  SELECT * FROM public.payments
) TO STDOUT WITH CSV HEADER;

-- 또는 Supabase 대시보드에서:
-- Table Editor → payments 테이블 → Export → CSV
```

## 주의사항

1. **CASCADE 옵션**: `TRUNCATE ... CASCADE`는 외래 키로 연결된 다른 테이블의 데이터도 삭제할 수 있습니다. 주의하세요.

2. **RLS 정책**: Row Level Security 정책이 설정되어 있다면, 관리자 권한으로 실행해야 합니다.

3. **복구 불가**: `TRUNCATE` 또는 `DELETE`로 삭제한 데이터는 복구할 수 없습니다.

4. **등록 정보**: `enrollments` 테이블의 데이터는 `payments`와 연결되어 있을 수 있으므로, 결제 내역을 삭제하면 등록 정보도 확인이 필요합니다.

## 확인 쿼리

초기화 후 다음 쿼리로 확인:

```sql
-- 결제 내역 개수 확인
SELECT COUNT(*) as total_payments FROM public.payments;

-- 결제 상태별 개수 확인
SELECT status, COUNT(*) as count 
FROM public.payments 
GROUP BY status;

-- 최근 결제 내역 확인 (없어야 함)
SELECT * FROM public.payments 
ORDER BY created_at DESC 
LIMIT 10;
```

