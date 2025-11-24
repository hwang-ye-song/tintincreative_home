# 관리자 계정 설정 가이드

## 방법 1: Supabase 대시보드 사용 (권장)

1. Supabase 대시보드에 로그인
2. Authentication > Users 메뉴로 이동
3. "Add user" 버튼 클릭
4. 다음 정보 입력:
   - Email: `admin@admin.com`
   - Password: `tintin051414`
   - Auto Confirm User: 체크
5. 사용자 생성 후, SQL Editor에서 다음 쿼리 실행:

```sql
-- 관리자 프로필 설정
INSERT INTO public.profiles (
  id,
  email,
  name,
  role,
  created_at
) 
SELECT 
  id,
  email,
  '관리자',
  'admin',
  now()
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    email = 'admin@admin.com',
    name = '관리자';
```

## 방법 2: Supabase CLI 사용

### Windows (PowerShell)
```powershell
.\scripts\create-admin.ps1
```

### Linux/Mac
```bash
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh
```

또는 직접 실행:
```bash
supabase auth admin create-user \
  --email admin@admin.com \
  --password tintin051414 \
  --email-confirm true
```

그 다음 마이그레이션 실행:
```bash
supabase migration up
```

## 방법 3: SQL 직접 실행

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행:

```sql
-- 1. 먼저 사용자를 생성 (Supabase 대시보드에서 수동으로 생성 필요)
-- 2. 그 다음 프로필 설정

INSERT INTO public.profiles (
  id,
  email,
  name,
  role,
  created_at
) 
SELECT 
  id,
  email,
  '관리자',
  'admin',
  now()
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    email = 'admin@admin.com',
    name = '관리자';
```

## 로그인 정보

- **이메일**: `admin@admin.com`
- **비밀번호**: `tintin051414`

## 확인

관리자 계정으로 로그인한 후 `/admin` 페이지에 접근할 수 있어야 합니다.

