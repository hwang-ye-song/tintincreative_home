# 토스 페이먼츠 연동 설정 가이드

## 1. Supabase Edge Function 배포

### 1-1. Supabase CLI 설치 (선택사항)

로컬에서 테스트하려면 Supabase CLI가 필요합니다:

```bash
npm install -g supabase
```

### 1-2. Edge Function 배포

Supabase 대시보드에서 직접 배포하거나 CLI를 사용할 수 있습니다.

#### 방법 A: Supabase 대시보드에서 배포

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Edge Functions** 클릭
4. **Create a new function** 클릭
5. Function 이름: `approve-payment`
6. `supabase/functions/approve-payment/index.ts` 파일 내용을 복사하여 붙여넣기
7. **Deploy** 클릭

#### 방법 B: Supabase CLI 사용

```bash
# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref aufvgzuokvttpguslkwm

# Edge Function 배포
supabase functions deploy approve-payment
```

### 1-3. 환경 변수 설정 (중요!)

Supabase 대시보드에서 시크릿 키를 환경 변수로 설정해야 합니다:

1. Supabase 대시보드 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Edge Functions** 클릭
4. **Settings** 또는 **Environment Variables** 클릭
5. 다음 환경 변수 추가:
   - **Key**: `TOSS_PAYMENTS_SECRET_KEY`
   - **Value**: `test_sk_ORzdMaqN3wxBzK4gNPEYV5AkYXQG` (테스트 키)
   - **Value (프로덕션)**: 실제 프로덕션 시크릿 키

⚠️ **보안 주의사항**:
- 시크릿 키는 절대 클라이언트 코드나 `.env` 파일에 포함하지 마세요
- Supabase 대시보드의 환경 변수에만 저장하세요
- 프로덕션과 테스트 환경의 키를 분리하세요

## 2. 클라이언트 환경 변수 확인

`.env` 또는 `DB.env` 파일에 다음이 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://aufvgzuokvttpguslkwm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_TOSS_PAYMENTS_CLIENT_KEY=test_ck_KNbdOvk5rkWX19R4L5Knrn07xlzm
```

## 3. 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 커리큘럼 페이지에서 "지금 등록하기" 또는 "수강 신청하기" 버튼 클릭

3. 토스 페이먼츠 테스트 결제 진행:
   - 카드번호: `4111-1111-1111-1111`
   - 유효기간: 미래 날짜 (예: 12/25)
   - CVC: `123`
   - 비밀번호: `123456`

4. 결제 완료 후 결제 완료 페이지로 리다이렉트되는지 확인

## 4. 프로덕션 배포 시 주의사항

1. **프로덕션 키 사용**:
   - 테스트 키(`test_ck_...`, `test_sk_...`) 대신 실제 프로덕션 키 사용
   - Supabase Edge Function 환경 변수에 프로덕션 시크릿 키 설정

2. **도메인 설정**:
   - 토스 페이먼츠 대시보드에서 승인된 도메인 설정
   - Webhook URL 설정 (선택사항)

3. **에러 처리**:
   - 결제 실패 시 적절한 에러 메시지 표시
   - 로그 모니터링 설정

## 5. 문제 해결

### Edge Function이 작동하지 않는 경우

1. Supabase 대시보드에서 Edge Function 로그 확인
2. 환경 변수 `TOSS_PAYMENTS_SECRET_KEY`가 설정되었는지 확인
3. Edge Function이 올바르게 배포되었는지 확인

### 결제 승인이 실패하는 경우

1. 토스 페이먼츠 대시보드에서 결제 내역 확인
2. 시크릿 키가 올바른지 확인
3. 네트워크 오류인지 확인

## 참고 자료

- [토스 페이먼츠 개발자 문서](https://docs.tosspayments.com/)
- [Supabase Edge Functions 문서](https://supabase.com/docs/guides/functions)

