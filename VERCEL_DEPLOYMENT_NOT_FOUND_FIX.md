# Vercel DEPLOYMENT_NOT_FOUND 에러 완전 해결 가이드

## 1. 즉시 해결 방법

### 방법 1: Vercel 대시보드에서 새 배포 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 `tintincreative_homepage` 선택

2. **Deployments 탭 확인**
   - 최신 배포가 있는지 확인
   - 배포 상태가 "Building", "Ready", "Error" 중 어느 것인지 확인

3. **새 배포 트리거**
   - 최신 배포가 없거나 실패했다면:
     - **"..."** 메뉴 → **"Redeploy"** 클릭
     - 또는 빈 커밋 푸시:
       ```bash
       git commit --allow-empty -m "Trigger redeploy"
       git push origin main
       ```

### 방법 2: 배포 URL 확인

- 올바른 URL: `https://tintincreativehomepage.vercel.app`
- 잘못된 URL 예시:
  - `https://tintincreativehomepage.vercel.app/deployment-id` ❌
  - `https://tintincreativehomepage-xxx.vercel.app` (삭제된 배포) ❌

## 2. 근본 원인 분석

### 무엇이 문제인가?

**DEPLOYMENT_NOT_FOUND**는 Vercel이 요청한 배포를 찾을 수 없다는 의미입니다.

### 발생 가능한 시나리오:

#### 시나리오 1: 배포가 아직 생성되지 않음
- **원인**: GitHub에 푸시했지만 Vercel이 아직 배포를 시작하지 않음
- **조건**: 
  - Vercel과 GitHub 연결이 끊어짐
  - Vercel 프로젝트가 삭제됨
  - 빌드가 실패하여 배포가 생성되지 않음

#### 시나리오 2: 배포가 삭제됨
- **원인**: Vercel 대시보드에서 배포를 수동으로 삭제함
- **조건**: 
  - 오래된 배포를 정리하면서 실수로 삭제
  - Vercel 계정 문제로 배포가 삭제됨

#### 시나리오 3: 잘못된 URL 사용
- **원인**: 특정 배포 ID를 포함한 URL을 사용
- **조건**: 
  - Preview 배포 URL을 사용했는데 해당 배포가 삭제됨
  - 직접 배포 URL을 사용했는데 배포가 만료됨

#### 시나리오 4: 빌드 실패
- **원인**: 빌드가 실패하여 배포가 생성되지 않음
- **조건**: 
  - 환경 변수 누락
  - 빌드 스크립트 오류
  - 의존성 설치 실패

## 3. 개념 이해

### Vercel 배포 시스템의 작동 방식

```
GitHub Push → Vercel Webhook → Build Process → Deployment Creation → URL 생성
```

1. **GitHub Push**: 코드를 GitHub에 푸시
2. **Vercel Webhook**: Vercel이 변경사항 감지
3. **Build Process**: `npm run build` 실행
4. **Deployment Creation**: 빌드 산출물로 배포 생성
5. **URL 생성**: 고유한 배포 URL 할당

### 배포 ID와 URL의 관계

- **Production 배포**: `https://tintincreativehomepage.vercel.app`
  - 항상 최신 `main` 브랜치의 배포를 가리킴
  - 배포가 삭제되면 이전 배포로 자동 롤백

- **Preview 배포**: `https://tintincreativehomepage-git-branch-username.vercel.app`
  - 특정 커밋의 배포를 가리킴
  - 해당 커밋이 삭제되면 배포도 삭제됨

- **직접 배포 URL**: `https://tintincreativehomepage-xxx.vercel.app`
  - 특정 배포 ID를 포함
  - 배포가 삭제되면 404 에러 발생

### 왜 이 에러가 존재하는가?

1. **리소스 보호**: 존재하지 않는 배포에 대한 요청을 차단
2. **보안**: 삭제된 배포에 대한 접근 방지
3. **명확성**: 배포 상태를 명확하게 전달

## 4. 경고 신호 및 예방

### 이 에러를 유발할 수 있는 패턴:

#### ⚠️ 경고 신호 1: Preview 배포 URL 사용
```typescript
// 나쁜 예: Preview 배포 URL을 하드코딩
const API_URL = 'https://tintincreativehomepage-git-feature-abc123.vercel.app';

// 좋은 예: 환경 변수 사용
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
```

#### ⚠️ 경고 신호 2: 배포 ID를 URL에 포함
```typescript
// 나쁜 예: 배포 ID 포함
const url = `https://tintincreativehomepage-${deploymentId}.vercel.app`;

// 좋은 예: Production URL 사용
const url = 'https://tintincreativehomepage.vercel.app';
```

#### ⚠️ 경고 신호 3: 빌드 실패 무시
- 빌드가 실패하면 배포가 생성되지 않음
- 항상 Vercel 대시보드에서 빌드 로그 확인

#### ⚠️ 경고 신호 4: 환경 변수 누락
- 빌드는 성공하지만 런타임 에러 발생
- 환경 변수가 없으면 앱이 제대로 작동하지 않음

### 예방 방법:

1. **항상 Production URL 사용**
   - Preview 배포 URL은 임시이므로 사용하지 않기
   - Production URL은 항상 최신 배포를 가리킴

2. **환경 변수 확인**
   - 배포 전에 모든 환경 변수가 설정되어 있는지 확인
   - Production, Preview, Development 모두에 설정

3. **빌드 로그 모니터링**
   - 배포 후 항상 빌드 로그 확인
   - 에러가 있으면 즉시 수정

4. **자동 배포 확인**
   - GitHub에 푸시 후 Vercel이 자동으로 배포를 시작하는지 확인
   - Vercel과 GitHub 연결 상태 확인

## 5. 대안 및 해결 방법

### 대안 1: Vercel 대시보드에서 수동 재배포

**장점:**
- 즉시 배포 가능
- 빌드 로그를 실시간으로 확인 가능

**단점:**
- 수동 작업 필요
- 자동화되지 않음

**사용 시기:**
- 긴급한 배포가 필요할 때
- 빌드 문제를 디버깅할 때

### 대안 2: 빈 커밋으로 재배포 트리거

**장점:**
- 코드 변경 없이 재배포 가능
- 자동화된 워크플로우 유지

**단점:**
- Git 히스토리에 불필요한 커밋 추가

**사용 시기:**
- 환경 변수 변경 후 재배포가 필요할 때
- 빌드 설정 변경 후 재배포가 필요할 때

### 대안 3: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

**장점:**
- 로컬에서 직접 배포 가능
- 배포 상태를 터미널에서 확인 가능

**단점:**
- CLI 설치 필요
- 수동 작업 필요

**사용 시기:**
- CI/CD 파이프라인 구축 시
- 로컬에서 테스트 배포 시

## 6. 체크리스트

배포 문제 해결을 위한 확인 사항:

- [ ] Vercel 대시보드에 프로젝트가 존재함
- [ ] Vercel과 GitHub가 연결되어 있음
- [ ] 최신 커밋이 GitHub에 푸시됨
- [ ] Vercel 대시보드에 최신 배포가 있음
- [ ] 배포 상태가 "Ready" 또는 "Building"임
- [ ] 빌드 로그에 에러가 없음
- [ ] 환경 변수가 모두 설정됨
- [ ] 올바른 URL을 사용하고 있음 (Production URL)
- [ ] 배포가 삭제되지 않았음

## 7. 단계별 문제 해결

### Step 1: Vercel 대시보드 확인
1. https://vercel.com/dashboard 접속
2. 프로젝트 목록에서 `tintincreative_homepage` 찾기
3. 프로젝트가 없으면 새로 생성 필요

### Step 2: 배포 상태 확인
1. 프로젝트 선택 → **Deployments** 탭
2. 최신 배포 확인
3. 상태가 "Error"면 빌드 로그 확인

### Step 3: 빌드 로그 확인
1. 실패한 배포 클릭
2. **Build Logs** 확인
3. 에러 메시지 확인 및 수정

### Step 4: 재배포
1. **"..."** 메뉴 → **"Redeploy"** 클릭
2. 또는 새 커밋 푸시

### Step 5: URL 확인
- 올바른 URL: `https://tintincreativehomepage.vercel.app`
- 이 URL은 항상 최신 Production 배포를 가리킴

## 8. 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel 에러 코드 문서](https://vercel.com/docs/errors)
- [Vercel 커뮤니티 포럼](https://github.com/vercel/vercel/discussions)

