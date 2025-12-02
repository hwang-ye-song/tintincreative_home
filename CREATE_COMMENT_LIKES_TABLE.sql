-- comment_likes 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- comment_likes 테이블 생성
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.project_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- RLS 활성화
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 모든 사용자가 댓글 좋아요를 볼 수 있음
CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes
FOR SELECT
USING (true);

-- 인증된 사용자만 좋아요를 추가할 수 있음
CREATE POLICY "Authenticated users can create comment likes"
ON public.comment_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 삭제할 수 있음
CREATE POLICY "Users can delete their own comment likes"
ON public.comment_likes
FOR DELETE
USING (auth.uid() = user_id);

