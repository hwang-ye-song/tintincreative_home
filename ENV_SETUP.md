# 환경 변수 설정 가이드

## .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

## Supabase 정보 찾기

### 1. Supabase 대시보드 접속
- https://supabase.com/dashboard 접속
- 프로젝트 선택

### 2. API 설정에서 정보 확인
- 왼쪽 메뉴: **Settings** (⚙️) 클릭
- **API** 메뉴 선택
- 다음 정보 복사:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **anon public** key: `eyJhbGc...` 로 시작하는 긴 문자열

### 3. .env 파일에 입력

예시:
```env
VITE_SUPABASE_URL=https://chsuhfcfqlhgjhconbce.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoc3VoZmNmcWxoZ2poY29uYmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Windows에서 .env 파일 생성 방법

### 방법 1: PowerShell 사용
```powershell
cd lovable_homepage-main
@"
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
"@ | Out-File -FilePath .env -Encoding utf8
```

### 방법 2: 메모장 사용
1. 메모장 열기
2. 다음 내용 입력:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```
3. "다른 이름으로 저장"
4. 파일 이름: `.env` (앞에 점 포함!)
5. 파일 형식: "모든 파일" 선택
6. 인코딩: UTF-8
7. 저장 위치: `lovable_homepage-main` 폴더

### 방법 3: VS Code 사용
1. VS Code에서 프로젝트 열기
2. 새 파일 생성 (Ctrl+N)
3. 내용 입력 후 저장
4. 파일 이름: `.env`

## 중요 사항

1. **VITE_ 접두사 필수**: 환경 변수 이름은 반드시 `VITE_`로 시작해야 합니다
2. **따옴표 없이**: 값에 따옴표를 붙이지 마세요
3. **공백 주의**: `=` 앞뒤에 공백이 없어야 합니다
4. **서버 재시작**: `.env` 파일을 변경한 후에는 개발 서버를 재시작해야 합니다

## 확인

환경 변수가 제대로 설정되었는지 확인:

1. 서버 재시작: `npm run dev`
2. 브라우저 콘솔 확인 (F12)
3. 에러가 없으면 성공!

