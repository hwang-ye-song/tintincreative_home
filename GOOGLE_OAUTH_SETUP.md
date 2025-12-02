# Google OAuth 로그인 설정 가이드

## 문제
구글 로그인을 클릭하면 다음 오류가 발생합니다:
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

이 오류는 Supabase 프로젝트에서 Google OAuth 제공자가 활성화되지 않았기 때문입니다.

## 해결 방법

### 1단계: Google Cloud Console에서 OAuth 클라이언트 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com 접속
   - 프로젝트 선택 또는 새 프로젝트 생성

2. **OAuth 동의 화면 설정**
   - 왼쪽 메뉴: **APIs & Services** → **OAuth consent screen**
   - User Type 선택: **External** (일반 사용자용)
   - 앱 정보 입력:
     - App name: `Tintin Creative Home` (또는 원하는 이름)
     - User support email: 본인 이메일
     - Developer contact information: 본인 이메일
   - **Save and Continue** 클릭

3. **Scopes 설정**
   - 기본 scopes 유지 (email, profile, openid)
   - **Save and Continue** 클릭

4. **Test users 추가** (개발 중인 경우)
   - 테스트할 이메일 주소 추가
   - **Save and Continue** 클릭

5. **Credentials 생성**
   - 왼쪽 메뉴: **APIs & Services** → **Credentials**
   - 상단 **+ CREATE CREDENTIALS** → **OAuth client ID** 선택
   - Application type: **Web application**
   - Name: `Tintin Creative Home Web Client` (또는 원하는 이름)
   - **Authorized redirect URIs** 추가:
     ```
     https://aufvgzuokvttpguslkwm.supabase.co/auth/v1/callback
     ```
     - Supabase 프로젝트 URL에 `/auth/v1/callback`을 추가한 주소
   - **CREATE** 클릭
   - **Client ID**와 **Client Secret** 복사 (나중에 필요)

### 2단계: Supabase 대시보드에서 Google 제공자 활성화

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택: `aufvgzuokvttpguslkwm`

2. **Authentication 설정으로 이동**
   - 왼쪽 메뉴: **Authentication** 클릭
   - **Providers** 탭 선택

3. **Google 제공자 활성화**
   - **Google** 제공자 찾기
   - **Enable Google provider** 토글을 **ON**으로 변경

4. **OAuth 정보 입력**
   - **Client ID (for OAuth)**: Google Cloud Console에서 복사한 Client ID 붙여넣기
   - **Client Secret (for OAuth)**: Google Cloud Console에서 복사한 Client Secret 붙여넣기
   - **Save** 클릭

### 3단계: 리다이렉트 URL 확인

1. **URL 구성 확인**
   - Supabase 프로젝트 URL: `https://aufvgzuokvttpguslkwm.supabase.co`
   - 리다이렉트 URL: `https://aufvgzuokvttpguslkwm.supabase.co/auth/v1/callback`
   - 이 URL이 Google Cloud Console의 **Authorized redirect URIs**에 추가되어 있어야 합니다.

2. **로컬 개발용 리다이렉트 URL (선택사항)**
   - 로컬에서 테스트하려면 다음 URL도 추가:
     ```
     http://localhost:8080/auth/v1/callback
     ```

### 4단계: 테스트

1. **애플리케이션에서 구글 로그인 버튼 클릭**
2. **Google 로그인 화면이 나타나는지 확인**
3. **로그인 후 리다이렉트되는지 확인**

## 문제 해결

### "redirect_uri_mismatch" 오류
- Google Cloud Console의 **Authorized redirect URIs**에 Supabase 콜백 URL이 정확히 추가되어 있는지 확인
- URL은 정확히 일치해야 합니다 (마지막 슬래시 포함 여부도 중요)

### "invalid_client" 오류
- Client ID와 Client Secret이 올바르게 입력되었는지 확인
- Supabase 대시보드에서 다시 확인하고 저장

### 여전히 "Unsupported provider" 오류
- Supabase 대시보드에서 Google 제공자가 **Enabled** 상태인지 확인
- 페이지를 새로고침하고 다시 시도
- Supabase 프로젝트가 활성화되어 있는지 확인

## 추가 참고사항

### 프로덕션 환경
- 프로덕션 배포 시 Vercel 도메인도 **Authorized redirect URIs**에 추가해야 할 수 있습니다:
  ```
  https://tintincreativehomepage.vercel.app/auth/v1/callback
  ```
- 하지만 일반적으로 Supabase 콜백 URL만 추가하면 됩니다.

### 보안
- Client Secret은 절대 공개 저장소에 커밋하지 마세요
- Supabase 대시보드에서만 관리하세요

## 완료 확인

설정이 완료되면:
1. ✅ Google Cloud Console에 OAuth 클라이언트가 생성됨
2. ✅ Supabase 대시보드에서 Google 제공자가 활성화됨
3. ✅ Client ID와 Client Secret이 입력됨
4. ✅ Authorized redirect URI가 설정됨

이제 구글 로그인이 정상적으로 작동해야 합니다!

