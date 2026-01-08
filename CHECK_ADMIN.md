# 관리자 계정 확인 및 문제 해결

## 1. 서버 상태 확인

서버가 실행 중인지 확인하세요:
- 브라우저에서 `http://localhost:8080` 접속
- 터미널에서 `npm run dev` 실행 중인지 확인

## 2. 관리자 계정이 생성되었는지 확인

### Supabase 대시보드에서 확인

1. Supabase 대시보드 접속
2. **Authentication > Users** 메뉴로 이동
3. `admin@admin.com` 이메일을 가진 사용자가 있는지 확인

### SQL로 확인

SQL Editor에서 다음 쿼리 실행:

```sql
-- 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@admin.com';

-- 프로필 확인
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'admin@admin.com';
```

## 3. 관리자 계정이 없는 경우

### 방법 1: Supabase 대시보드에서 생성 (가장 간단)

1. **Authentication > Users** 메뉴로 이동
2. **"Add user"** 버튼 클릭
3. 다음 정보 입력:
   - **Email**: `admin@admin.com`
   - **Password**: `tintin051414`
   - **Auto Confirm User**: ✅ 체크 (중요!)
4. **"Create user"** 클릭

5. SQL Editor에서 프로필 설정:
```sql
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

### 방법 2: 회원가입으로 생성

1. 웹사이트에서 `/login` 페이지 접속
2. **"회원가입"** 클릭
3. 다음 정보 입력:
   - 이름: `관리자`
   - 이메일: `admin@admin.com`
   - 비밀번호: `tintin051414`
4. 회원가입 완료

5. Supabase 대시보드에서:
   - **Authentication > Users**에서 해당 사용자 찾기
   - **"..." 메뉴 > "Confirm user"** 클릭 (이메일 인증 완료)

6. SQL Editor에서 역할 설정:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@admin.com';
```

## 4. 로그인 문제 해결

### 문제: "Invalid login credentials" 에러

**원인**: 
- 비밀번호가 틀림
- 사용자가 존재하지 않음
- 이메일 인증이 완료되지 않음

**해결**:
1. Supabase 대시보드에서 사용자 확인
2. 비밀번호 재설정 또는 사용자 재생성
3. 이메일 인증 확인 (Auto Confirm 체크)

### 문제: "Email not confirmed" 에러

**원인**: 이메일 인증이 완료되지 않음

**해결**:
1. Supabase 대시보드 > Authentication > Users
2. 해당 사용자 찾기
3. **"..." 메뉴 > "Confirm user"** 클릭

### 문제: 로그인은 되지만 관리자 페이지 접근 불가

**원인**: 프로필의 `role`이 `'admin'`으로 설정되지 않음

**해결**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@admin.com';
```

## 5. 빠른 확인 스크립트

SQL Editor에서 실행하여 모든 것을 한 번에 확인:

```sql
-- 전체 확인
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created,
  p.name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@admin.com';
```

## 6. 완전히 새로 시작하기

기존 계정을 삭제하고 새로 만들기:

```sql
-- 1. 프로필 삭제
DELETE FROM public.profiles WHERE email = 'admin@admin.com';

-- 2. 사용자 삭제 (Supabase 대시보드에서 수동으로 삭제하거나)
-- Authentication > Users > 해당 사용자 > Delete

-- 3. 위의 "방법 1" 또는 "방법 2"로 다시 생성
```

## 로그인 정보

- **이메일**: `admin@admin.com`
- **비밀번호**: `tintin051414`

## 확인 방법

로그인 성공 후:
1. `/admin` 페이지 접속 시도
2. 접근 가능하면 성공!
3. 접근 불가하면 프로필의 `role` 확인 필요

