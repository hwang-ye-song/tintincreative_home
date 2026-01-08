-- 관리자 계정 초기화
-- 이 마이그레이션은 Supabase 대시보드에서 사용자를 먼저 생성한 후 실행해야 합니다.

-- 방법 1: Supabase 대시보드에서 사용자 생성 후 프로필 설정
-- Authentication > Users > Add user
-- Email: admin@admin.com
-- Password: tintin051414
-- Auto Confirm User: 체크

-- 프로필 생성/업데이트 함수
CREATE OR REPLACE FUNCTION init_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- email이 'admin@admin.com'인 사용자 찾기
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com'
  LIMIT 1;

  -- 사용자가 존재하는 경우 프로필 생성/업데이트
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      name,
      role,
      created_at
    ) VALUES (
      admin_user_id,
      'admin@admin.com',
      '관리자',
      'admin',
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        email = 'admin@admin.com',
        name = '관리자',
        updated_at = now();
    
    RAISE NOTICE '관리자 프로필이 성공적으로 설정되었습니다. 사용자 ID: %', admin_user_id;
  ELSE
    RAISE WARNING 'admin@admin.com 이메일을 가진 사용자를 찾을 수 없습니다.';
    RAISE WARNING '먼저 Supabase 대시보드(Authentication > Users)에서 사용자를 생성하세요.';
  END IF;
END;
$$;

-- 함수 실행
SELECT init_admin_profile();

-- 함수 정리
DROP FUNCTION IF EXISTS init_admin_profile();
