# 데이터베이스 설정 가이드

## 문제: "Could not find the table 'public.projects'"

이 에러는 Supabase 연결은 성공했지만, 데이터베이스 테이블이 아직 생성되지 않았다는 의미입니다.

## 해결 방법: 마이그레이션 실행

### 1단계: Supabase 대시보드 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (aufvgzuokvttpguslkwm)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: 마이그레이션 파일 실행

다음 순서대로 SQL 파일들을 실행하세요:

#### 1. 첫 번째 마이그레이션 (기본 테이블 생성)
- 파일: `supabase/migrations/20251117182758_0639ad93-2424-45e2-bdd6-806b3cef2c3e.sql`
- 이 파일을 SQL Editor에 복사하여 실행

#### 2. 두 번째 마이그레이션 (프로젝트 이미지 및 댓글)
- 파일: `supabase/migrations/20251117183803_208a8d36-44d5-40cc-93ca-7c0dd8ec960d.sql`
- 실행

#### 3. 세 번째 마이그레이션
- 파일: `supabase/migrations/20251123055013_e044162e-8622-447f-ae19-388a4aec5f27.sql`
- 실행

#### 4. 네 번째 마이그레이션
- 파일: `supabase/migrations/20251124090347_8a002c0f-64f6-493d-bb88-6d23666a951e.sql`
- 실행

#### 5. 다섯 번째 마이그레이션
- 파일: `supabase/migrations/20251124090821_8e01cd49-4616-444a-ad3a-d589df36b1ef.sql`
- 실행

#### 6. 관리자 및 커리큘럼 마이그레이션
- 파일: `supabase/migrations/20250101000000_add_admin_and_curriculum.sql`
- 실행

### 3단계: 실행 확인

각 마이그레이션 실행 후:
- "Success. No rows returned" 메시지 확인
- 에러가 없으면 다음 마이그레이션 실행

### 4단계: 테이블 확인

SQL Editor에서 다음 쿼리로 테이블이 생성되었는지 확인:

```sql
-- 모든 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

다음 테이블들이 있어야 합니다:
- `profiles`
- `projects`
- `project_comments`
- `project_likes`
- `courses`
- `enrollments`
- `curriculums` (관리자 마이그레이션 실행 후)

## 빠른 해결 방법

모든 마이그레이션을 한 번에 실행하려면:

1. SQL Editor에서 "New query" 클릭
2. 아래의 "전체 마이그레이션 통합" 섹션의 SQL을 복사하여 실행

## 문제 해결

### 에러: "relation already exists"

이미 테이블이 존재한다는 의미입니다. 다음 쿼리로 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

필요한 테이블이 모두 있으면 마이그레이션을 건너뛰어도 됩니다.

### 에러: "permission denied"

RLS (Row Level Security) 정책 문제일 수 있습니다. 마이그레이션 파일에 RLS 정책이 포함되어 있는지 확인하세요.

