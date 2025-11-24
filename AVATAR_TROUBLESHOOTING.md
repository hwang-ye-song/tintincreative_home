# 프로필 이미지 업로드 문제 해결 가이드

## 문제 분석 및 해결 단계

### 1. 데이터베이스 확인

먼저 Supabase SQL Editor에서 `CHECK_AVATAR_SETUP.sql`을 실행하여 현재 상태를 확인하세요:

```sql
-- CHECK_AVATAR_SETUP.sql 실행
```

확인 사항:
- ✅ `profiles` 테이블에 `avatar_url` 컬럼이 있는지
- ✅ `profiles` 테이블의 UPDATE RLS 정책이 있는지
- ✅ `avatars` 스토리지 버킷이 있는지
- ✅ 스토리지 RLS 정책이 올바르게 설정되어 있는지

### 2. 문제 해결

문제가 발견되면 `FIX_AVATAR_ISSUES.sql`을 실행하세요:

```sql
-- FIX_AVATAR_ISSUES.sql 실행
```

이 스크립트는:
- `avatar_url` 컬럼 추가
- 프로필 UPDATE RLS 정책 수정 (WITH CHECK 절 포함)
- `avatars` 스토리지 버킷 생성
- 스토리지 RLS 정책 설정

### 3. 코드 개선 사항

#### 3.1 상세한 로깅 추가
- 각 단계별로 콘솔 로그 출력
- 에러 발생 시 상세한 에러 정보 출력

#### 3.2 Storage 버킷 확인
- 업로드 전에 버킷 존재 여부 확인
- 버킷이 없으면 경고 메시지 출력

#### 3.3 에러 처리 개선
- 각 단계별로 구체적인 에러 메시지 제공
- RLS 정책 관련 에러 시 명확한 안내

### 4. TypeScript 타입 업데이트

`src/integrations/supabase/types.ts` 파일에 `avatar_url` 필드를 추가했습니다:

```typescript
profiles: {
  Row: {
    // ...
    avatar_url: string | null
  }
  Update: {
    // ...
    avatar_url?: string | null
  }
}
```

### 5. 테스트 방법

1. 브라우저 개발자 도구(F12) 열기
2. Console 탭 확인
3. 프로필 이미지 업로드 시도
4. 다음 로그 확인:
   - `Starting avatar upload for user: [user-id]`
   - `avatars bucket found: [bucket-info]`
   - `Uploading file: [file-name]`
   - `Upload successful: [upload-data]`
   - `Public URL generated: [url]`
   - `Updating profile with avatar_url: [url]`
   - `Profile updated successfully: [profile-data]`

### 6. 일반적인 문제

#### 문제 1: "column 'avatar_url' does not exist"
**해결**: `FIX_AVATAR_ISSUES.sql` 실행

#### 문제 2: "new row violates row-level security policy"
**해결**: 프로필 UPDATE RLS 정책 확인 및 수정
```sql
-- 정책 확인
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE';
```

#### 문제 3: "The resource already exists"
**해결**: 기존 파일 삭제 후 재업로드 또는 `upsert: true` 사용

#### 문제 4: Storage 버킷이 없음
**해결**: `FIX_AVATAR_ISSUES.sql` 실행하여 버킷 생성

### 7. 확인 체크리스트

- [ ] `profiles` 테이블에 `avatar_url` 컬럼 존재
- [ ] 프로필 UPDATE RLS 정책이 `WITH CHECK` 절 포함
- [ ] `avatars` 스토리지 버킷 존재
- [ ] 스토리지 INSERT 정책 설정됨
- [ ] TypeScript 타입 정의 업데이트됨
- [ ] 브라우저 콘솔에서 에러 없음

### 8. 추가 디버깅

문제가 계속되면 다음을 확인하세요:

1. **RLS 정책 확인**:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

2. **스토리지 정책 확인**:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%avatar%';
```

3. **현재 사용자 확인**:
```sql
SELECT auth.uid();
```

4. **프로필 데이터 확인**:
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

