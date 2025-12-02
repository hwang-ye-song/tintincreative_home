import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Pencil, Trash2, Heart, Edit2, X, Eye, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Comment, Like, Project } from "@/types";
import { Helmet } from "react-helmet-async";

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

const getPlainTextExcerpt = (html?: string | null, length: number = 160) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.substring(0, length);
};

const VISIBILITY_FILTER = "is_hidden.is.null,is_hidden.eq.false";
type CommentWithReplies = Comment & { replies?: Comment[] };
type CommentLikeRow = { comment_id: string; user_id: string };

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleComments, setVisibleComments] = useState(10);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyLoadingId, setReplyLoadingId] = useState<string | null>(null);
  const [commentSort, setCommentSort] = useState<"newest" | "oldest" | "popular">("oldest");
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: project, isLoading, refetch, error } = useQuery<Project>({
    queryKey: ["project", id, currentUserId],
    queryFn: async () => {
      if (!id) {
        throw new Error("유효하지 않은 프로젝트 ID 입니다.");
      }
      
      // 현재 사용자가 관리자인지 확인
      let isAdmin = false;
      if (currentUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUserId)
          .single();
        isAdmin = (profile as any)?.role === "admin";
      }
      
      // 먼저 필터 없이 조회 (작성자/관리자 체크를 위해)
      let { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .eq("id", id)
        .single();
      
      // is_hidden 컬럼이 없는 경우 에러 처리
      if (error && error.message?.includes("is_hidden")) {
        // 컬럼이 없으면 그냥 반환 (기존 동작)
      } else if (error) {
        // 다른 에러면 필터 적용해서 재시도
        ({ data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles (name, avatar_url)
          `)
          .eq("id", id)
          .or(VISIBILITY_FILTER)
          .single());
      } else if (data) {
        // 프로젝트를 찾았으면 권한 체크
        const isOwner = currentUserId && data.user_id === currentUserId;
        const isHidden = data.is_hidden === true;
        
        // 일반 사용자가 숨겨진 프로젝트에 접근하려고 하면 거부
        if (isHidden && !isOwner && !isAdmin) {
          throw new Error("프로젝트를 찾을 수 없습니다.");
        }
      }

      if (error) throw error;
      if (!data) throw new Error("프로젝트를 찾을 수 없습니다.");
      return data as Project;
    },
    enabled: Boolean(id),
    staleTime: 30 * 1000, // 30초간 캐시
  });

  useEffect(() => {
    if (project) {
      fetchComments();
      fetchLikes();
      incrementViewCount();
    }
  }, [project, currentUserId]);

  const incrementViewCount = async () => {
    if (!project) return;
    
    try {
      const { error } = await supabase
        .rpc('increment_project_view_count', { project_id: project.id });
      
      if (error) console.error('Failed to increment view count:', error);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

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
      const enriched = await attachCommentLikes(data as Comment[]);
      setComments(enriched);
      setVisibleComments(10);
    }
  };

  const sortedComments = useMemo(() => {
    const arr = [...comments];
    switch (commentSort) {
      case "newest":
        return arr.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      case "oldest":
        return arr.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
      case "popular":
        return arr.sort((a, b) => {
          const likeDiff = (b.likeCount || 0) - (a.likeCount || 0);
          if (likeDiff !== 0) return likeDiff;
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        });
      default:
        return arr;
    }
  }, [comments, commentSort]);

  const structuredComments = useMemo(() => {
    const map = new Map<string, CommentWithReplies & { replies: CommentWithReplies[] }>();
    sortedComments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    const roots: (CommentWithReplies & { replies: CommentWithReplies[] })[] = [];

    map.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.replies?.push(comment);
        } else {
          roots.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    const compareAscending = (a: Comment, b: Comment) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const compareDescending = (a: Comment, b: Comment) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    const compareTopLevel = (a: Comment, b: Comment) => {
      switch (commentSort) {
        case "newest":
          return compareDescending(a, b);
        case "oldest":
          return compareAscending(a, b);
        case "popular":
          const likeDiff = (b.likeCount || 0) - (a.likeCount || 0);
          if (likeDiff !== 0) return likeDiff;
          return compareDescending(a, b);
        default:
          return 0;
      }
    };

    return roots
      .sort(compareTopLevel)
      .map((root) => ({
        ...root,
        replies: root.replies?.sort(compareAscending) || [],
      }));
  }, [sortedComments, commentSort]);

  const visibleTopLevelComments = structuredComments.slice(0, visibleComments);
  const hasMoreComments = structuredComments.length > visibleComments;

  const fetchLikes = async () => {
    if (!project) return;

    const { data, error } = await supabase
      .from('project_likes')
      .select('id, user_id, project_id')
      .eq('project_id', project.id);

    if (!error && data) {
      setLikes(data);
      setIsLiked(data.some(like => like.user_id === currentUserId));
    }
  };

  const attachCommentLikes = async (commentList: Comment[]) => {
    if (!commentList.length) return commentList;

    const { data, error } = await (supabase as any)
      .from("comment_likes")
      .select("comment_id, user_id")
      .in("comment_id", commentList.map((c) => c.id));

    const likeRows: CommentLikeRow[] = (data as CommentLikeRow[]) || [];

    if (error) {
      return commentList.map((comment) => ({
        ...comment,
        likeCount: comment.likeCount ?? 0,
        userLiked: comment.userLiked ?? false,
      }));
    }

    const likeMap = new Map<
      string,
      { count: number; userLiked: boolean }
    >();

    likeRows.forEach((like) => {
      const prev = likeMap.get(like.comment_id) || {
        count: 0,
        userLiked: false,
      };
      likeMap.set(like.comment_id, {
        count: prev.count + 1,
        userLiked: prev.userLiked || like.user_id === currentUserId,
      });
    });

    return commentList.map((comment) => {
      const meta = likeMap.get(comment.id);
      return {
        ...comment,
        likeCount: meta?.count || 0,
        userLiked: meta?.userLiked || false,
      };
    });
  };

  const handleToggleLike = async () => {
    if (!currentUserId || !project) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('project_likes')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_likes')
          .insert({
            project_id: project.id,
            user_id: currentUserId
          });

        if (error) throw error;
      }

      fetchLikes();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "좋아요 처리에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project || !currentUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: project.id,
          user_id: currentUserId,
          content: newComment.trim()
        });

      if (error) throw error;

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다."
      });

      setNewComment("");
      fetchComments();
      setVisibleComments(10);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 작성에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !project || !currentUserId) return;

    setReplyLoadingId(parentCommentId);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: project.id,
          user_id: currentUserId,
          content: replyContent.trim(),
          parent_comment_id: parentCommentId,
        });

      if (error) throw error;

      toast({
        title: "답글 작성 완료",
        description: "답글이 성공적으로 작성되었습니다.",
      });

      setReplyContent("");
      setReplyingToId(null);
      await fetchComments();
      setVisibleComments(10);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "답글 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setReplyLoadingId(null);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      const { error } = await supabase
        .from('project_comments')
        .update({ content: editingContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "댓글 수정 완료",
        description: "댓글이 성공적으로 수정되었습니다."
      });

      setEditingCommentId(null);
      setEditingContent("");
      fetchComments();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 수정에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다."
      });

      fetchComments();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 삭제에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!currentUserId) {
      toast({
        title: "로그인 필요",
        description: "공감하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    const alreadyLiked = target.userLiked;

    try {
      if (alreadyLiked) {
        const { error } = await (supabase as any)
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("comment_likes")
          .insert({
            comment_id: commentId,
            user_id: currentUserId,
          });
        if (error) throw error;
      }

      await fetchComments();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "공감 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleDateSort = () => {
    setCommentSort((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "프로젝트 삭제 완료",
        description: "프로젝트가 성공적으로 삭제되었습니다."
      });

      navigate("/portfolio");
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 삭제에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!id || !project) return;

    setIsUpdatingVisibility(true);
    try {
      const nextVisibility = !project.is_hidden;
      const { error } = await supabase
        .from("projects")
        .update({ is_hidden: nextVisibility })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: nextVisibility ? "프로젝트 숨김" : "프로젝트 공개",
        description: nextVisibility
          ? "프로젝트가 숨김 처리되었습니다."
          : "프로젝트가 다시 공개되었습니다.",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const isOwner = currentUserId && project?.user_id === currentUserId;

  const renderComment = (
    comment: CommentWithReplies,
    depth: number = 0
  ) => {
    const commenterName = comment.profiles?.name || "익명";
    const commenterAvatar = getOptimizedAvatarUrl(comment.profiles?.avatar_url);
    const isReply = depth > 0;
    const isEditing = editingCommentId === comment.id;
    const isReplyingHere = replyingToId === comment.id;

    return (
      <div key={comment.id} className={`space-y-3 ${isReply ? "ml-6" : ""}`}>
        <div className="flex gap-3">
          <Avatar className="h-7 w-7 flex-shrink-0">
            {commenterAvatar && (
              <AvatarImage src={commenterAvatar} alt={`${commenterName} 프로필 이미지`} />
            )}
            <AvatarFallback className="text-xs">
              {commenterName.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{commenterName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <div className="flex gap-1">
                {currentUserId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      if (isReplyingHere) {
                        setReplyingToId(null);
                        setReplyContent("");
                      } else {
                        setReplyingToId(comment.id);
                        setReplyContent("");
                      }
                    }}
                  >
                    답글
                  </Button>
                )}
                {currentUserId === comment.user_id && (
                  <>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditComment(comment.id)}
                          className="h-6 px-2"
                        >
                          <span className="text-xs">저장</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          className="h-6 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingContent(comment.content);
                          }}
                          className="h-6 px-2"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="text-xs mt-2"
                rows={2}
              />
            ) : (
              <p className="text-xs text-foreground break-words leading-relaxed">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs flex items-center gap-1"
                onClick={() => handleToggleCommentLike(comment.id)}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${
                    comment.userLiked ? "text-primary fill-primary/20" : ""
                  }`}
                />
                <span>{comment.likeCount || 0}</span>
              </Button>
            </div>

            {isReplyingHere && currentUserId && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  rows={2}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={replyLoadingId === comment.id || !replyContent.trim()}
                  >
                    {replyLoadingId === comment.id ? "작성 중..." : "답글 작성"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingToId(null);
                      setReplyContent("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project || error) {
    const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-muted-foreground">
              {errorMessage ? `프로젝트를 불러올 수 없습니다: ${errorMessage}` : "프로젝트를 찾을 수 없습니다."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const authorName = project.profiles?.name || '익명';
  const authorAvatar = getOptimizedAvatarUrl(project.profiles?.avatar_url);
  const projectDescription = project.description || "";
  const optimizedProjectImage = getOptimizedImageUrl(project.image_url);
  const descriptionExcerpt = getPlainTextExcerpt(projectDescription);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{project.title} - 프로젝트 상세</title>
        <meta name="description" content={descriptionExcerpt} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={descriptionExcerpt} />
        <meta property="og:image" content={optimizedProjectImage || ''} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/portfolio")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/portfolio/edit/${id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                >
                  {isUpdatingVisibility
                    ? "처리 중..."
                    : project.is_hidden
                      ? "공개 전환"
                      : "숨김 전환"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            )}
          </div>

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
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-heading text-lg md:text-xl font-bold">{project.title}</h1>
                
                {/* Like and View Stats */}
                <div className="flex items-center gap-3 min-w-fit">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">{project.view_count || 0}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleLike}
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <Heart 
                      className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span className="text-xs">{likes.length}</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {authorAvatar && (
                    <AvatarImage src={authorAvatar} alt={`${authorName} 프로필 이미지`} />
                  )}
                  <AvatarFallback className="text-xs">{authorName.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(project.created_at), {
                      addSuffix: true,
                      locale: ko
                    })}
                  </p>
                </div>
                {project.is_hidden && (
                  <Badge variant="destructive" className="ml-auto">
                    숨김 상태
                  </Badge>
                )}
              </div>

              {project.category && (
                <div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {project.category}
                  </Badge>
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium">사용 기술: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Description */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <h3 className="text-xs md:text-sm font-medium mb-3">프로젝트 설명</h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-xs md:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: projectDescription || "<p class='text-muted-foreground'>아직 작성된 설명이 없습니다.</p>" }}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs md:text-sm font-medium">댓글 ({comments.length})</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={commentSort === "newest" || commentSort === "oldest" ? "default" : "outline"}
                    className="h-7 px-3 text-xs"
                    onClick={handleToggleDateSort}
                  >
                    {commentSort === "oldest" ? "오래된순" : "최신순"}
                  </Button>
                  <Button
                    size="sm"
                    variant={commentSort === "popular" ? "default" : "outline"}
                    className="h-7 px-3 text-xs"
                    onClick={() => setCommentSort("popular")}
                  >
                    추천순
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {visibleTopLevelComments.map((comment) => renderComment(comment))}

                {structuredComments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </p>
                )}
              </div>

              {hasMoreComments && (
                <div className="text-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleComments((prev) => prev + 10)}
                  >
                    댓글 더 보기
                  </Button>
                </div>
              )}

              {/* Comment Form - Moved to bottom */}
              {currentUserId ? (
                <form onSubmit={handleSubmitComment} className="border-t pt-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    rows={3}
                    className="mb-2 text-xs md:text-sm"
                  />
                  <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
                    {loading ? "작성 중..." : "댓글 작성"}
                  </Button>
                </form>
              ) : (
                <p className="text-xs text-muted-foreground border-t pt-4">
                  댓글을 작성하려면 로그인이 필요합니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 프로젝트가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailPage;
