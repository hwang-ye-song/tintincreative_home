import React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { devLog, sanitizeHtml } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Project, Comment } from "@/types";
import type { User } from "@supabase/supabase-js";

const getOptimizedImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.includes("supabase.co/storage")) {
    return `${url}?width=800&quality=80`;
  }
  return url;
};

const getOptimizedAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.includes("supabase.co/storage")) {
    return `${url}?width=128&quality=80`;
  }
  return url;
};

interface ProjectDetailProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetail = ({ project, open, onOpenChange }: ProjectDetailProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (project) {
      fetchComments();
    }
  }, [project]);

  const fetchComments = async () => {
    if (!project) return;

    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        profiles (name, avatar_url)
      `)
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: project.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다."
      });

      setNewComment("");
      fetchComments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 작성에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  const authorName = project.profiles?.name || "익명";
  const authorAvatar = getOptimizedAvatarUrl(project.profiles?.avatar_url);
  const projectDescription = project.description || "";
  const optimizedProjectImage = getOptimizedImageUrl(project.image_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Image */}
          {optimizedProjectImage && (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={optimizedProjectImage}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Project Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar>
                {authorAvatar && (
                  <AvatarImage src={authorAvatar} alt={`${authorName} 프로필 이미지`} />
                )}
                <AvatarFallback>{authorName.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(project.created_at), {
                    addSuffix: true,
                    locale: ko
                  })}
                </p>
              </div>
            </div>

            {project.category && (
              <div>
                <span className="text-sm font-medium">카테고리: </span>
                <Badge variant="secondary">{project.category}</Badge>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium">사용 기술: </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">프로젝트 설명</h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(projectDescription) || "<p class='text-muted-foreground'>아직 작성된 설명이 없습니다.</p>",
                }}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">댓글 ({comments.length})</h3>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  rows={3}
                  className="mb-2"
                />
                <Button type="submit" disabled={loading || !newComment.trim()}>
                  {loading ? "작성 중..." : "댓글 작성"}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">
                댓글을 작성하려면 로그인이 필요합니다.
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => {
                const commenterName = comment.profiles?.name || "익명";
                const commenterAvatar = getOptimizedAvatarUrl(comment.profiles?.avatar_url);

                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      {commenterAvatar && (
                        <AvatarImage src={commenterAvatar} alt={`${commenterName} 프로필 이미지`} />
                      )}
                      <AvatarFallback className="text-xs">
                        {commenterName.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {commenterName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ko
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
