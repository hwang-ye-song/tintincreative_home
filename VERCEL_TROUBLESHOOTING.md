# Vercel 배포 문제 해결 가이드

## 🔴 가장 흔한 문제: 환경 변수 미설정

Vercel 배포가 실패하는 가장 큰 원인은 **환경 변수가 설정되지 않았기 때문**입니다.

## ✅ 해결 방법

### 1단계: Vercel 대시보드에서 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 배포한 프로젝트 선택

2. **환경 변수 설정 페이지로 이동**
   - 프로젝트 선택 → **Settings** → **Environment Variables** 클릭

3. **필수 환경 변수 추가**

   다음 두 개의 환경 변수를 **반드시** 추가하세요:

   #### 환경 변수 1:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://aufvgzuokvttpguslkwm.supabase.co`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크

   #### 환경 변수 2:
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZnZnenVva3Z0dHBndXNsa3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQxNDMsImV4cCI6MjA3OTU2MDE0M30.f7MPivJwL8ujDmaxJdB7ECkt9PPD53rXsdcykDXaB5c`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크

4. **저장 후 재배포**
   - 환경 변수 저장 후 **Deployments** 탭으로 이동
   - 최신 배포의 **"..."** 메뉴 → **"Redeploy"** 클릭
   - 또는 GitHub에 새로운 커밋을 푸시하면 자동 재배포됩니다

### 2단계: 배포 로그 확인

환경 변수를 설정한 후에도 문제가 있다면:

1. **Vercel 대시보드** → **Deployments** 탭
2. 실패한 배포 클릭
3. **"Build Logs"** 확인
4. 에러 메시지 확인

### 3단계: 일반적인 문제 해결

#### 문제 1: "Environment variable not found" 에러
- ✅ 해결: 위의 1단계를 따라 환경 변수를 설정하세요
- ✅ 확인: 환경 변수 이름이 정확히 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`인지 확인
- ✅ 확인: Production, Preview, Development 모두에 설정되어 있는지 확인

#### 문제 2: 빌드는 성공하지만 사이트가 작동하지 않음
- ✅ 확인: 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인
- ✅ 확인: Network 탭에서 Supabase API 호출이 실패하는지 확인
- ✅ 해결: 환경 변수가 올바르게 설정되었는지 다시 확인

#### 문제 3: 404 에러 (라우팅 문제)
- ✅ 확인: `vercel.json`의 `rewrites` 설정이 올바른지 확인
- ✅ 해결: 이미 설정되어 있으므로 문제없습니다

#### 문제 4: 빌드 실패
- ✅ 확인: Vercel 대시보드의 Build Logs 확인
- ✅ 확인: `package.json`의 빌드 스크립트가 `npm run build`인지 확인
- ✅ 확인: Node.js 버전이 호환되는지 확인 (Vercel은 자동으로 감지합니다)

## 📋 체크리스트

배포 전 확인사항:

- [ ] Vercel 대시보드에서 `VITE_SUPABASE_URL` 환경 변수 설정됨
- [ ] Vercel 대시보드에서 `VITE_SUPABASE_PUBLISHABLE_KEY` 환경 변수 설정됨
- [ ] 환경 변수가 Production, Preview, Development 모두에 설정됨
- [ ] 환경 변수 값에 따옴표나 공백이 없음
- [ ] GitHub에 코드가 푸시됨
- [ ] Vercel이 GitHub 저장소에 연결됨

## 🚀 빠른 재배포 방법

환경 변수를 설정한 후:

1. **방법 1**: Vercel 대시보드에서 재배포
   - Deployments → 최신 배포 → "..." → "Redeploy"

2. **방법 2**: GitHub에 빈 커밋 푸시
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

3. **방법 3**: 코드 변경 후 푸시
   - 아무 파일이나 수정하고 커밋/푸시

## 💡 추가 팁

- 환경 변수는 **대소문자를 구분**합니다
- `VITE_` 접두사가 **반드시** 필요합니다
- 환경 변수 값에 **따옴표를 붙이지 마세요**
- 환경 변수 변경 후 **재배포가 필요**합니다

## 📞 여전히 문제가 있다면

1. Vercel 대시보드의 Build Logs 전체 내용 확인
2. 에러 메시지를 복사하여 검색
3. Vercel 공식 문서 확인: https://vercel.com/docs

