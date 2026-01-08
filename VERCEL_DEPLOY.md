# Vercel 배포 가이드

## 1. Vercel 계정 준비
1. [Vercel](https://vercel.com)에 가입하거나 로그인
2. GitHub 계정으로 연동 (권장)

## 2. GitHub에 코드 푸시
```bash
# 현재 코드를 GitHub에 푸시
git add .
git commit -m "Vercel 배포 준비"
git push origin main
```

## 3. Vercel에서 프로젝트 배포

### 방법 1: Vercel 웹 대시보드 사용 (권장)
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
   - **Install Command**: `npm install` (자동 설정됨)

### 방법 2: Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

## 4. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수
1. **VITE_SUPABASE_URL**
   - Supabase 프로젝트의 URL
   - 예: `https://aufvgzuokvttpguslkwm.supabase.co`

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   - Supabase 프로젝트의 공개 키 (anon key)
   - 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **VITE_GOOGLE_FORM_URL** (선택사항)
   - Google Form URL (있는 경우)

### 환경 변수 설정 방법
1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Environment Variables" 클릭
3. 각 환경 변수 추가:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Supabase URL
   - **Environment**: Production, Preview, Development 모두 선택
4. "Save" 클릭
5. 나머지 환경 변수도 동일하게 추가

## 5. 배포 후 확인
1. 배포가 완료되면 Vercel이 자동으로 URL 제공
2. 예: `https://your-project-name.vercel.app`
3. 사이트 접속하여 정상 작동 확인

## 6. 자동 배포 설정
- GitHub에 코드를 푸시하면 자동으로 배포됩니다
- `main` 브랜치에 푸시 → Production 배포
- 다른 브랜치에 푸시 → Preview 배포

## 7. 커스텀 도메인 설정 (선택사항)
1. Vercel 대시보드 → 프로젝트 → "Settings" → "Domains"
2. 도메인 추가
3. DNS 설정 안내에 따라 도메인 설정

## 문제 해결

### 빌드 실패 시
- Vercel 대시보드의 "Deployments" 탭에서 로그 확인
- 환경 변수가 제대로 설정되었는지 확인
- `package.json`의 빌드 스크립트 확인

### 환경 변수 관련 오류
- 모든 환경 변수에 `VITE_` 접두사가 있는지 확인
- Production, Preview, Development 모두에 설정되어 있는지 확인

### 라우팅 오류 (404)
- `vercel.json`의 `rewrites` 설정 확인
- React Router의 모든 경로가 `/index.html`로 리다이렉트되는지 확인

