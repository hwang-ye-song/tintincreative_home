import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { getOptimizedAvatarUrl, getOptimizedThumbnailUrl } from "@/lib/imageUtils";

interface PortfolioCardProps {
  id: string;
  title: string;
  student: string;
  description: string;
  category: string;
  tags: string[];
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
  avatarUrl?: string | null;
}

// Utility to strip HTML and get plain text preview
const getTextPreview = (html: string, maxLength: number = 150): string => {
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
  avatarUrl
}: PortfolioCardProps) => {
  const queryClient = useQueryClient();
  const plainDescription = getTextPreview(description);
  const initials = student
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
  const optimizedAvatarUrl = getOptimizedAvatarUrl(avatarUrl);

  // 마우스 호버 시 프로젝트 데이터 프리페칭
  const handleMouseEnter = () => {
    // 유효한 ID인지 확인
    if (!id || id === "example-2" || id.startsWith("example")) {
      return; // 잘못된 ID는 프리페칭하지 않음
    }
    
    // 캐시된 사용자 정보 가져오기
    const userData = queryClient.getQueryData<{ user: any | null; userRole: string | null }>(["currentUser"]);
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
          console.warn("프리페칭 실패:", error);
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
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm p-4"
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex gap-4">
        {/* Avatar on the left */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          {optimizedAvatarUrl && (
            <AvatarImage 
              src={optimizedAvatarUrl} 
              alt={`${student} 프로필 이미지`}
              loading="lazy"
            />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content in the middle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
          </div>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-primary/90 text-primary-foreground border-0 rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {plainDescription}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>제작: {student}</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {category}
            </Badge>
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">{viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            <span className="text-xs">{likeCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="text-xs">{commentCount}</span>
          </div>
        </div>
      </div>
    </Card>
  );
});
