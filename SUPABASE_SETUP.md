# Supabase 연결 가이드

이 프로젝트는 Supabase를 백엔드로 사용합니다. 로컬에서 개발하려면 Supabase 프로젝트를 생성하고 연결해야 합니다.

## 방법 1: 기존 Lovable Supabase 프로젝트 사용 (가장 간단)

Lovable에서 자동으로 생성된 Supabase 프로젝트가 있다면:

1. **Lovable 프로젝트 페이지 접속**
   - https://lovable.dev/projects/22ff449e-c4a5-4a6a-853d-4584a71afe23
   - 또는 Lovable 대시보드에서 프로젝트 찾기

2. **Supabase 연결 정보 확인**
   - Lovable 프로젝트 설정에서 Supabase 정보 확인
   - 또는 Supabase 대시보드에서 직접 확인

3. **환경 변수 설정**
   - 프로젝트 루트에 `.env` 파일 생성
   - 아래 정보 입력

## 방법 2: 새 Supabase 프로젝트 생성

### 1단계: Supabase 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - https://supabase.com 접속
   - 계정 생성 또는 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 정보 입력:
     - **Name**: 원하는 프로젝트 이름
     - **Database Password**: 강력한 비밀번호 설정 (기억해두세요!)
     - **Region**: 가장 가까운 지역 선택
   - "Create new project" 클릭

3. **프로젝트 생성 대기** (약 2분 소요)

### 2단계: API 키 확인

1. **Supabase 대시보드에서**
   - 왼쪽 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
   - **API** 메뉴 선택

2. **필요한 정보 복사**
   - **Project URL**: `https://xxxxx.supabase.co` 형식
   - **anon public key**: `eyJhbGc...` 로 시작하는 긴 문자열

### 3단계: 환경 변수 설정

1. **프로젝트 루트에 `.env` 파일 생성**

   Windows (PowerShell):
   ```powershell
   cd lovable_homepage-main
   Copy-Item .env.example .env
   ```

   Mac/Linux:
   ```bash
   cd lovable_homepage-main
   cp .env.example .env
   ```

2. **`.env` 파일 편집**

   `.env` 파일을 열고 다음 내용 입력:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

   예시:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 4단계: 데이터베이스 마이그레이션

1. **Supabase 대시보드에서 SQL Editor 열기**

2. **마이그레이션 파일 실행**

   `supabase/migrations/` 폴더에 있는 SQL 파일들을 순서대로 실행:
   
   - `20251117182758_0639ad93-2424-45e2-bdd6-806b3cef2c3e.sql`
   - `20251117183803_208a8d36-44d5-40cc-93ca-7c0dd8ec960d.sql`
   - `20251123055013_e044162e-8622-447f-ae19-388a4aec5f27.sql`
   - `20251124090347_8a002c0f-64f6-493d-bb88-6d23666a951e.sql`
   - `20251124090821_8e01cd49-4616-444a-ad3a-d589df36b1ef.sql`
   - `20250101000000_add_admin_and_curriculum.sql`
   - `20250101000001_init_admin_user.sql` (선택사항)

3. **또는 Supabase CLI 사용** (선택사항)

   ```bash
   # Supabase CLI 설치 (필요한 경우)
   npm install -g supabase

   # Supabase 프로젝트 연결
   supabase link --project-ref your-project-id

   # 마이그레이션 실행
   supabase db push
   ```

### 5단계: 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

## 방법 3: Supabase CLI로 로컬 개발 (고급)

로컬에서 Supabase를 실행하려면:

1. **Supabase CLI 설치**
   ```bash
   npm install -g supabase
   ```

2. **Supabase 초기화**
   ```bash
   cd lovable_homepage-main
   supabase init
   ```

3. **로컬 Supabase 시작**
   ```bash
   supabase start
   ```

4. **로컬 환경 변수 설정**
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=로컬에서 생성된 anon key
   ```

## 연결 확인

1. **브라우저 콘솔 확인**
   - 개발자 도구 (F12) 열기
   - Console 탭에서 에러 확인
   - Supabase 연결 관련 에러가 없으면 성공!

2. **로그인 테스트**
   - `/login` 페이지 접속
   - 회원가입 시도
   - Supabase 대시보드에서 사용자 확인

## 문제 해결

### 문제: "Invalid API key" 에러

**원인**: 환경 변수가 잘못되었거나 설정되지 않음

**해결**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수!)
3. 값에 따옴표나 공백이 없는지 확인
4. 서버 재시작

### 문제: "Failed to fetch" 에러

**원인**: 
- Supabase URL이 잘못됨
- 네트워크 문제
- CORS 설정 문제

**해결**:
1. Supabase URL이 올바른지 확인
2. Supabase 대시보드 > Settings > API > CORS 설정 확인
3. 브라우저 네트워크 탭에서 요청 확인

### 문제: 테이블이 없다는 에러

**원인**: 마이그레이션이 실행되지 않음

**해결**:
1. Supabase 대시보드 > SQL Editor에서 마이그레이션 파일 실행
2. 또는 Supabase CLI로 마이그레이션 실행

## 보안 주의사항

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

- `.gitignore`에 `.env`가 포함되어 있는지 확인
- 공개 저장소에 API 키를 노출하지 마세요
- 프로덕션에서는 환경 변수를 안전하게 관리하세요

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트 가이드](https://supabase.com/docs/reference/javascript/introduction)
- [Lovable Supabase 통합 가이드](https://docs.lovable.dev/features/supabase)

