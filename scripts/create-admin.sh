#!/bin/bash

# 관리자 계정 생성 스크립트
# Supabase CLI가 설치되어 있어야 합니다.

echo "관리자 계정을 생성합니다..."

# Supabase CLI를 사용하여 사용자 생성
supabase auth admin create-user \
  --email admin@admin.com \
  --password tintin051414 \
  --email-confirm true

echo "관리자 계정이 생성되었습니다."
echo "이제 마이그레이션 파일을 실행하여 프로필을 설정하세요:"
echo "supabase migration up"

