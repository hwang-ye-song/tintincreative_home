@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "tintincreative_home-main\package.json" (
    cd "tintincreative_home-main"
) else (
    echo package.json을 찾을 수 없습니다.
    pause
    exit /b 1
)
echo 프로젝트 디렉토리로 이동했습니다.
echo 현재 디렉토리: %CD%
echo.
echo 개발 서버를 시작합니다 (8080 포트)...
npm run dev
pause

