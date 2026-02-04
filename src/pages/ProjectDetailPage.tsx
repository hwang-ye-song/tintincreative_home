import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Pencil, Trash2, Heart, Edit2, X, Eye, ThumbsUp, Video, File, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Comment, Like, Project, ProjectAttachment } from "@/types";
import { Helmet } from "react-helmet-async";
import type { User } from "@supabase/supabase-js";

import { 
  getOptimizedImageUrl, 
  getOptimizedAvatarUrl, 
  getOptimizedLargeImageUrl 
} from "@/lib/imageUtils";
import { devLog, sanitizeHtml } from "@/lib/utils";

const getPlainTextExcerpt = (html?: string | null, length: number = 160) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.substring(0, length);
};

type CommentWithReplies = Comment & { replies?: Comment[] };
type CommentLikeRow = { comment_id: string; user_id: string };

// 작성자의 다른 글 목록 컴포넌트
const AuthorOtherProjects = ({ userId, currentProjectId }: { userId: string; currentProjectId: string }) => {
  const navigate = useNavigate();
  
  const { data: allProjects, isLoading } = useQuery({
    queryKey: ["authorProjects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, created_at")
        .eq("user_id", userId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return null;
  if (!allProjects || allProjects.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-lg font-semibold mb-4">이 작성자의 다른 글</h3>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-full">
          {allProjects.map((project) => {
            const isCurrent = project.id === currentProjectId;
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/portfolio/${project.id}`)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors text-left min-w-[200px] max-w-[300px] ${
                  isCurrent 
                    ? "bg-primary/10 border-2 border-primary cursor-pointer hover:bg-primary/20" 
                    : "bg-muted hover:bg-muted/80 cursor-pointer"
                }`}
              >
                <p className={`text-sm font-medium line-clamp-2 ${isCurrent ? "text-primary" : ""}`}>
                  {project.title || "제목 없음"}
                  {isCurrent && <span className="ml-2 text-xs">(현재 글)</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(project.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  const [isUpdatingBest, setIsUpdatingBest] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState<ProjectAttachment | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  // 사용자 정보를 React Query로 병렬 로딩
  // 에러가 발생해도 프로젝트는 표시되도록 에러 처리
  const { data: userData } = useQuery<{ user: User | null; userRole: string | null }>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { user: null, userRole: null };

        // role 컬럼이 없을 수 있으므로 에러 처리
        // 모든 컬럼을 선택하여 role이 없어도 에러가 발생하지 않도록 함
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // 에러가 발생하거나 프로필이 없으면 null 반환
          if (profileError || !profile) {
            if (import.meta.env.DEV && profileError?.code !== 'PGRST116' && profileError?.code !== '42P01') {
              devLog.warn("Profile fetch failed:", profileError);
            }
            return {
              user,
              userRole: null,
            };
          }

          return {
            user,
            userRole: (profile as { role?: string } | null)?.role || null,
          };
        } catch (profileError: unknown) {
          // profiles 테이블이나 role 컬럼이 없을 경우 null 반환 (조용히 처리)
          // 400 오류는 개발 환경에서만 경고 출력
          if (import.meta.env.DEV && profileError && typeof profileError === 'object' && 'code' in profileError) {
            const code = (profileError as { code?: string }).code;
            if (code !== 'PGRST116' && code !== '42P01') {
              devLog.warn("Profile role fetch failed:", profileError);
            }
          }
          return {
            user,
            userRole: null,
          };
        }
      } catch (error) {
        devLog.warn("User fetch failed:", error);
        return { user: null, userRole: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    retry: false,
  });

  const currentUserId = userData?.user?.id || null;
  const userRole = userData?.userRole || null;

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const { data: project, isLoading, refetch, error } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("유효하지 않은 프로젝트 ID 입니다.");
      }
      
      // 사용자 정보를 캐시에서 가져오기 (없으면 null)
      const cachedUserData = queryClient.getQueryData<{ user: User | null; userRole: string | null }>(["currentUser"]);
      const cachedUserId = cachedUserData?.user?.id || null;
      const cachedUserRole = cachedUserData?.userRole || null;
      const isAdmin = cachedUserRole === "admin";
      
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
        // 다른 에러면 필터 적용해서 재시도 (단, .single()과 함께 사용할 때는 or()를 사용하지 않음)
        ({ data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles (name, avatar_url)
          `)
          .eq("id", id)
          .single());
      } else if (data) {
        // 프로젝트를 찾았으면 권한 체크
        const isOwner = cachedUserId && data.user_id === cachedUserId;
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
    enabled: Boolean(id), // id만 있으면 바로 실행 (사용자 정보는 선택적)
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 댓글을 React Query로 병렬 로딩 (프로젝트와 독립적으로 로드)
  const { data: commentsData } = useQuery<Comment[]>({
    queryKey: ["projectComments", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data) return [];
      
      // 사용자 정보를 캐시에서 가져오기
      const cachedUserData = queryClient.getQueryData<{ user: User | null; userRole: string | null }>(["currentUser"]);
      const cachedUserId = cachedUserData?.user?.id || null;
      
      return await attachCommentLikes(data as Comment[], cachedUserId);
    },
    enabled: Boolean(id), // 프로젝트와 독립적으로 로드
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 좋아요를 React Query로 병렬 로딩 (프로젝트와 독립적으로 로드)
  const { data: likesData } = useQuery<Like[]>({
    queryKey: ["projectLikes", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('project_likes')
        .select('id, user_id, project_id')
        .eq('project_id', id);

      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(id), // 프로젝트와 독립적으로 로드
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // commentsData와 likesData가 로드되면 상태 업데이트
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
      setVisibleComments(10);
    }
  }, [commentsData]);

  useEffect(() => {
    if (likesData) {
      setLikes(likesData);
      setIsLiked(likesData.some(like => like.user_id === currentUserId));
    }
  }, [likesData, currentUserId]);

  useEffect(() => {
    if (project) {
      incrementViewCount();
    }
  }, [project]);

  const incrementViewCount = async () => {
    if (!project) return;
    
    try {
      const { error } = await supabase
        .rpc('increment_project_view_count', { project_id: project.id });
      
      if (error) devLog.error('Failed to increment view count:', error);
    } catch (error) {
      devLog.error('Error incrementing view count:', error);
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

  const attachCommentLikes = async (commentList: Comment[], userId: string | null = null) => {
    if (!commentList.length) return commentList;

    // comment_likes 테이블이 없을 수 있으므로 에러 처리
    let likeRows: CommentLikeRow[] = [];
    try {
      const { data, error } = await (supabase as any)
        .from("comment_likes")
        .select("comment_id, user_id")
        .in("comment_id", commentList.map((c) => c.id));

      if (error) {
        // 테이블이 없거나 에러가 발생하면 빈 배열 반환 (조용히 처리)
        // 개발 환경에서만 경고 출력
        if (import.meta.env.DEV && error.code !== 'PGRST205') {
          devLog.warn("comment_likes 테이블 조회 실패:", error);
        }
        return commentList.map((comment) => ({
          ...comment,
          likeCount: comment.likeCount ?? 0,
          userLiked: comment.userLiked ?? false,
        }));
      }

      likeRows = (data as CommentLikeRow[]) || [];
    } catch (error) {
      // 테이블이 존재하지 않을 경우 조용히 처리 (개발 환경에서만 경고)
      if (import.meta.env.DEV) {
        devLog.warn("comment_likes 테이블이 존재하지 않습니다:", error);
      }
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
        userLiked: prev.userLiked || like.user_id === userId,
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

      // 좋아요 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectLikes", id] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
      // 댓글 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectComments", id] });
      setVisibleComments(10);
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
      // 댓글 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectComments", id] });
      setVisibleComments(10);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "답글 작성에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
      // 댓글 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectComments", id] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 수정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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

      // 댓글 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectComments", id] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
      // comment_likes 테이블이 없을 수 있으므로 에러 처리
      if (alreadyLiked) {
        const { error } = await (supabase as any)
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);
        if (error) {
          // 테이블이 없거나 에러가 발생하면 조용히 처리 (개발 환경에서만 경고)
          if (import.meta.env.DEV && error.code !== 'PGRST205') {
            devLog.warn("comment_likes 삭제 실패:", error);
          }
          return;
        }
      } else {
        const { error } = await (supabase as any)
          .from("comment_likes")
          .insert({
            comment_id: commentId,
            user_id: currentUserId,
          });
        if (error) {
          // 테이블이 없거나 에러가 발생하면 조용히 처리 (개발 환경에서만 경고)
          if (import.meta.env.DEV && error.code !== 'PGRST205') {
            devLog.warn("comment_likes 삽입 실패:", error);
          }
          return;
        }
      }

      // 댓글 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projectComments", id] });
    } catch (error: unknown) {
      // 테이블이 존재하지 않을 경우 조용히 처리 (개발 환경에서만 경고)
      if (import.meta.env.DEV) {
        devLog.warn("comment_likes 테이블이 존재하지 않습니다:", error);
      }
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleToggleBest = async () => {
    if (!id || !project) return;

    setIsUpdatingBest(true);
    try {
      const nextBest = !project.is_best;
      
      // 카테고리는 변경하지 않고 is_best만 변경
      const { error } = await supabase
        .from("projects")
        .update({ is_best: nextBest } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: nextBest ? "BEST 지정 완료" : "BEST 해제 완료",
        description: nextBest
          ? "프로젝트가 BEST로 지정되었습니다."
          : "프로젝트가 BEST에서 해제되었습니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "BEST 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBest(false);
    }
  };

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdminEmail = userData?.user?.email && adminEmails.includes(userData.user.email);
  const isOwner = currentUserId && project?.user_id === currentUserId;
  const isAdmin = (userRole === 'admin' || userRole === 'teacher') || isAdminEmail;

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
                {(currentUserId === comment.user_id || isAdmin) && (
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
                        {currentUserId === comment.user_id && (
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
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 px-2 text-destructive hover:text-destructive"
                          title={isAdmin && currentUserId !== comment.user_id ? "관리자 권한으로 삭제" : ""}
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

  // 프로젝트가 로드되기 전에도 기본 레이아웃 표시 (더 빠른 느낌)
  if (isLoading && !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-32"></div>
              <div className="w-full aspect-video bg-muted animate-pulse rounded-lg"></div>
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
              </div>
            </div>
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
  const optimizedProjectImage = getOptimizedLargeImageUrl(project.image_url);
  const descriptionExcerpt = getPlainTextExcerpt(projectDescription);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{project.title} - 프로젝트 상세</title>
        <meta name="description" content={descriptionExcerpt} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={descriptionExcerpt} />
        <meta property="og:image" content={optimizedProjectImage || `${window.location.origin}/images/og_image_one.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={optimizedProjectImage || `${window.location.origin}/images/og_image_one.png`} />
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

            {(isOwner || isAdmin) && (
              <div className="flex flex-wrap gap-2">
                {(isOwner || isAdmin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/portfolio/edit/${id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant={project.is_best ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleBest}
                    disabled={isUpdatingBest}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isUpdatingBest
                      ? "처리 중..."
                      : project.is_best
                        ? "BEST 해제"
                        : "BEST 지정"}
                  </Button>
                )}
                {(isOwner || isAdmin) && (
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
                )}
                {(isOwner || isAdmin) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    title={isAdmin && !isOwner ? "관리자 권한으로 삭제" : ""}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                )}
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
                  loading="eager"
                  decoding="async"
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

              <div className="flex items-center gap-2 flex-wrap">
                {project.is_best && (
                  <Badge variant="default" className="bg-yellow-500/90 text-yellow-50 border-0 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    BEST
                  </Badge>
                )}
                {project.category && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {project.category}
                  </Badge>
                )}
                {isAdmin && (
                  <Button
                    variant={project.is_best ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleBest}
                    disabled={isUpdatingBest}
                    className="h-7 text-xs"
                  >
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    {isUpdatingBest
                      ? "처리 중..."
                      : project.is_best
                        ? "BEST 해제"
                        : "BEST 지정"}
                  </Button>
                )}
              </div>

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

            {/* Video Section - 본문보다 먼저 표시 */}
            {project.video_url && (
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-medium mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  프로젝트 영상
                </h3>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  {project.video_url.includes('youtube.com') || project.video_url.includes('youtu.be') ? (
                    <iframe
                      src={project.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : project.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={project.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={project.video_url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Project Description */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <h3 className="text-xs md:text-sm font-medium mb-3">프로젝트 설명</h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-xs md:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(projectDescription) || "<p class='text-muted-foreground'>아직 작성된 설명이 없습니다.</p>" }}
              />
            </div>

            {/* Attachments Section */}
            {project.attachments && Array.isArray(project.attachments) && project.attachments.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <h3 className="text-xs md:text-sm font-medium mb-3 flex items-center gap-2">
                  <File className="h-4 w-4" />
                  첨부 파일 ({project.attachments.length})
                </h3>
                <div className="space-y-2">
                  {project.attachments.map((attachment: ProjectAttachment, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (attachment.password) {
                          setCurrentAttachment(attachment);
                          setPasswordInput("");
                          setPasswordDialogOpen(true);
                        } else {
                          window.open(attachment.url, '_blank');
                        }
                      }}
                      className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-md transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : ''}
                            {attachment.password && (
                              <span className="ml-2 text-primary">🔒 비밀번호 보호</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

          {/* 작성자의 다른 글 목록 */}
          {project?.user_id && (
            <AuthorOtherProjects userId={project.user_id} currentProjectId={project.id} />
          )}
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

      {/* 비밀번호 확인 다이얼로그 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 다운로드</DialogTitle>
            <DialogDescription>
              {currentAttachment && (
                <>
                  파일: <strong>{currentAttachment.name}</strong>
                  <br />
                  이 파일은 비밀번호로 보호되어 있습니다. 다운로드하려면 비밀번호를 입력하세요.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="download-password">비밀번호</Label>
              <Input
                id="download-password"
                type="text"
                maxLength={4}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력 (최대 4자리)"
                className="mt-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentAttachment) {
                    if (passwordInput === currentAttachment.password) {
                      window.open(currentAttachment.url, '_blank');
                      setPasswordDialogOpen(false);
                      setPasswordInput("");
                      setCurrentAttachment(null);
                    } else {
                      toast({
                        title: "비밀번호 오류",
                        description: "비밀번호가 일치하지 않습니다.",
                        variant: "destructive"
                      });
                    }
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordInput("");
                setCurrentAttachment(null);
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!currentAttachment) return;
                if (passwordInput === currentAttachment.password) {
                  window.open(currentAttachment.url, '_blank');
                  setPasswordDialogOpen(false);
                  setPasswordInput("");
                  setCurrentAttachment(null);
                } else {
                  toast({
                    title: "비밀번호 오류",
                    description: "비밀번호가 일치하지 않습니다.",
                    variant: "destructive"
                  });
                }
              }}
            >
              다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetailPage;
