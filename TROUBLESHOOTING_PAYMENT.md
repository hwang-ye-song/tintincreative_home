# 결제 시스템 문제 해결 가이드

## "결제 요청 실패" 또는 "결제 정보 자동저장 실패" 오류

### 1. 브라우저 콘솔에서 에러 확인

1. 브라우저에서 F12 키를 눌러 개발자 도구 열기
2. **Console** 탭 클릭
3. 결제 버튼을 다시 클릭
4. 빨간색 에러 메시지 확인

### 2. 일반적인 원인과 해결 방법

#### 원인 1: Supabase 마이그레이션 미실행

**증상:**
- 콘솔에 "null value in column" 또는 "23502" 에러
- "payment_key" 관련 에러

**해결 방법:**

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 다음 SQL 실행:

```sql
-- payment_key를 NULL 허용으로 변경
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_payment_key_key;

ALTER TABLE public.payments
ALTER COLUMN payment_key DROP NOT NULL;

-- NULL이 아닌 payment_key에 대해서만 UNIQUE 제약조건 추가
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_key_unique 
  ON public.payments (payment_key) 
  WHERE payment_key IS NOT NULL;

-- 기존 빈 문자열을 NULL로 변환
UPDATE public.payments
SET payment_key = NULL
WHERE payment_key = '' OR payment_key LIKE 'temp_%' OR payment_key LIKE 'pending_%';
```

#### 원인 2: RLS (Row Level Security) 정책 문제

**증상:**
- 콘솔에 "permission denied" 또는 "RLS" 관련 에러
- "new row violates row-level security policy" 에러

**해결 방법:**

Supabase SQL Editor에서 다음 실행:

```sql
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'payments';

-- 정책 재생성
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 원인 3: payments 테이블이 없음

**증상:**
- 콘솔에 "relation 'payments' does not exist" 에러

**해결 방법:**

Supabase SQL Editor에서 다음 마이그레이션 실행:

```sql
-- payments 테이블 생성 (전체 마이그레이션)
-- supabase/migrations/20250126000000_add_payments_table.sql 파일 내용 실행
```

### 3. 전체 마이그레이션 실행 순서

다음 순서로 마이그레이션을 실행하세요:

1. `20250126000000_add_payments_table.sql` - payments 테이블 생성
2. `20250126000001_update_enrollments_for_curriculums.sql` - enrollments 테이블 수정
3. `20250126000002_fix_payments_payment_key_nullable.sql` - payment_key NULL 허용

### 4. 테스트 방법

1. 브라우저 콘솔 열기 (F12)
2. 결제 버튼 클릭
3. 콘솔에서 에러 메시지 확인
4. 에러 메시지를 Supabase SQL Editor에서 검색하여 해결

### 5. 여전히 문제가 있는 경우

브라우저 콘솔의 전체 에러 메시지를 복사하여 확인해주세요.

