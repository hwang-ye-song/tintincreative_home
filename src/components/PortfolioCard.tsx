import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye, Play, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { getOptimizedAvatarUrl, getOptimizedThumbnailUrl } from "@/lib/imageUtils";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, extractFirstImageFromHtml, devLog } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface PortfolioCardProps {
  id: string;
  title: string;
  student: string;
  description: string | null | undefined;
  category: string;
  tags: string[] | null | undefined;
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isBest?: boolean;
}

// Utility to strip HTML and get plain text preview
const getTextPreview = (html: string | null | undefined, maxLength: number = 150): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const PortfolioCard = memo(({ 
  id,
  title, 
  student, 
  description, 
  category, 
  tags, 
  commentCount = 0,
  likeCount = 0,
  viewCount = 0,
  avatarUrl,
  imageUrl,
  videoUrl,
  isBest = false
}: PortfolioCardProps) => {
  const queryClient = useQueryClient();
  const plainDescription = getTextPreview(description);
  const initials = student
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
  const optimizedAvatarUrl = getOptimizedAvatarUrl(avatarUrl);
  const uploadedThumbnailUrl = getOptimizedThumbnailUrl(imageUrl);
  
  // 썸네일 우선순위: 1. 이미지 등록 > 2. 유튜브 영상 썸네일 > 3. 본문의 이미지
  let finalThumbnailUrl: string | null = null;
  
  // 1순위: 이미지 등록
  if (uploadedThumbnailUrl) {
    finalThumbnailUrl = uploadedThumbnailUrl;
  }
  // 2순위: 유튜브 영상 썸네일 (이미지 등록이 없을 때만)
  else if (videoUrl) {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      finalThumbnailUrl = getYouTubeThumbnailUrl(videoId, 'hqdefault');
    }
  }
  // 3순위: 본문의 이미지 (이미지 등록과 유튜브 썸네일이 없을 때만)
  else if (description) {
    const contentImageUrl = extractFirstImageFromHtml(description);
    if (contentImageUrl) {
      finalThumbnailUrl = getOptimizedThumbnailUrl(contentImageUrl);
    }
  }
  
  const hasMedia = finalThumbnailUrl || videoUrl;

  // 마우스 호버 시 프로젝트 데이터 프리페칭
  const handleMouseEnter = () => {
    // 유효한 ID인지 확인
    if (!id || id === "example-2" || id.startsWith("example")) {
      return; // 잘못된 ID는 프리페칭하지 않음
    }
    
    // 캐시된 사용자 정보 가져오기
    const userData = queryClient.getQueryData<{ user: User | null; userRole: string | null }>(["currentUser"]);
    const currentUserId = userData?.user?.id || null;
    const userRole = userData?.userRole || null;
    
    queryClient.prefetchQuery({
      queryKey: ["project", id],
      queryFn: async () => {
        const isAdmin = userRole === "admin";
        
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles (name, avatar_url)
          `)
          .eq("id", id)
          .single();
        
        if (error) {
          // 에러가 발생해도 조용히 처리 (프리페칭이므로)
          if (import.meta.env.DEV) {
            devLog.warn("프리페칭 실패:", error);
          }
          throw error;
        }
        if (!data) {
          throw new Error("프로젝트를 찾을 수 없습니다.");
        }
        
        const project = data as Project;
        const isOwner = currentUserId && project.user_id === currentUserId;
        const isHidden = project.is_hidden === true;
        
        if (isHidden && !isOwner && !isAdmin) {
          throw new Error("프로젝트를 찾을 수 없습니다.");
        }
        
        return project;
      },
      staleTime: 30 * 1000,
      retry: false, // 프리페칭은 실패해도 재시도하지 않음
    }).catch(() => {
      // 프리페칭 실패는 조용히 처리
    });
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col"
      onMouseEnter={handleMouseEnter}
    >
      {/* Thumbnail Section (YouTube style) */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {finalThumbnailUrl ? (
          <img
            src={finalThumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // YouTube 썸네일 로드 실패 시 플레이스홀더로 대체
              if (finalThumbnailUrl?.includes('youtube.com')) {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <svg class="h-16 w-16 text-primary/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  `;
                }
              }
            }}
          />
        ) : videoUrl ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Play className="h-16 w-16 text-primary/50" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-8 w-8 text-primary/50" />
              </div>
            </div>
          </div>
        )}
        
        {/* Video Play Icon Overlay */}
        {videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="rounded-full bg-white/90 p-4 group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-primary fill-primary ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            {optimizedAvatarUrl && (
              <AvatarImage 
                src={optimizedAvatarUrl} 
                alt={`${student} 프로필 이미지`}
                loading="lazy"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
              <span>{student}</span>
              {isBest && (
                <>
                  <span>•</span>
                  <Badge variant="default" className="bg-yellow-500/90 text-yellow-50 border-0 text-xs px-1.5 py-0 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    BEST
                  </Badge>
                </>
              )}
              {category && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0">
                    {category}
                  </Badge>
                </>
              )}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-primary/90 text-primary-foreground border-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Description */}
            {plainDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {plainDescription}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
