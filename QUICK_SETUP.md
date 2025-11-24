# 빠른 Supabase 연결 가이드

## 현재 프로젝트 정보

프로젝트 ID: `chsuhfcfqlhgjhconbce`

Supabase URL 형식: `https://chsuhfcfqlhgjhconbce.supabase.co`

## 1단계: Supabase 대시보드 접속

1. **Supabase 웹사이트 접속**
   - https://supabase.com/dashboard
   - 로그인 (또는 계정 생성)

2. **프로젝트 찾기**
   - 프로젝트 ID: `chsuhfcfqlhgjhconbce`로 검색
   - 또는 프로젝트 목록에서 찾기

## 2단계: API 키 확인

1. **Settings 메뉴로 이동**
   - 왼쪽 사이드바에서 ⚙️ **Settings** 클릭
   - **API** 메뉴 선택

2. **필요한 정보 복사**
   - **Project URL**: 이미 알고 있음 → `https://chsuhfcfqlhgjhconbce.supabase.co`
   - **anon public key**: `eyJhbGc...` 로 시작하는 긴 문자열 복사

## 3단계: .env 파일 생성

프로젝트 루트 폴더 (`lovable_homepage-main`)에 `.env` 파일을 생성하세요.

### Windows PowerShell로 생성:

```powershell
cd lovable_homepage-main
@"
VITE_SUPABASE_URL=https://chsuhfcfqlhgjhconbce.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=여기에_복사한_anon_key_붙여넣기
"@ | Out-File -FilePath .env -Encoding utf8
```

### 또는 메모장으로:

1. 메모장 열기
2. 다음 내용 입력 (anon key는 실제 값으로 교체):
   ```
   VITE_SUPABASE_URL=https://chsuhfcfqlhgjhconbce.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. "다른 이름으로 저장"
   - 파일 이름: `.env` (점 포함!)
   - 파일 형식: "모든 파일"
   - 저장 위치: `lovable_homepage-main` 폴더

## 4단계: 서버 재시작

환경 변수를 설정한 후 서버를 재시작하세요:

```bash
# 현재 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

## 5단계: 연결 확인

1. 브라우저에서 `http://localhost:8080` 접속
2. 개발자 도구 (F12) 열기
3. Console 탭에서 에러 확인
4. 에러가 없으면 연결 성공! ✅

## 문제 해결

### "Invalid API key" 에러가 나는 경우

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 파일 내용이 올바른지 확인:
   - `VITE_` 접두사 필수
   - 따옴표 없이
   - 공백 없이
3. 서버 재시작 확인

### Supabase 프로젝트를 찾을 수 없는 경우

Lovable에서 자동 생성된 프로젝트가 아니라면:

1. **새 프로젝트 생성**
   - Supabase 대시보드에서 "New Project" 클릭
   - 프로젝트 생성 후 위의 2-4단계 반복

2. **또는 Lovable에서 프로젝트 정보 확인**
   - https://lovable.dev/projects/22ff449e-c4a5-4a6a-853d-4584a71afe23
   - 프로젝트 설정에서 Supabase 정보 확인

## 다음 단계

연결이 완료되면:

1. **데이터베이스 마이그레이션 실행**
   - Supabase 대시보드 > SQL Editor
   - `supabase/migrations/` 폴더의 SQL 파일들 실행

2. **관리자 계정 생성**
   - `CHECK_ADMIN.md` 파일 참고

3. **테스트**
   - `/login` 페이지에서 회원가입/로그인 테스트

