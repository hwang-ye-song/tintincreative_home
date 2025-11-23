import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Pencil, Trash2, Heart, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
  };
}

interface Like {
  id: string;
  user_id: string;
}

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (project) {
      fetchComments();
      fetchLikes();
    }
  }, [project, currentUserId]);

  const fetchComments = async () => {
    if (!project) return;

    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        profiles (name)
      `)
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

  const fetchLikes = async () => {
    if (!project) return;

    const { data, error } = await supabase
      .from('project_likes')
      .select('id, user_id')
      .eq('project_id', project.id);

    if (!error && data) {
      setLikes(data);
      setIsLiked(data.some(like => like.user_id === currentUserId));
    }
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

  const isOwner = currentUserId && project?.user_id === currentUserId;

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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/portfolio/edit/${id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
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
            {project.image_url && (
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Project Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-heading text-xl md:text-2xl font-bold">{project.title}</h1>
                
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleLike}
                  className="flex items-center gap-2 min-w-fit"
                >
                  <Heart 
                    className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-sm">{likes.length}</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{project.profiles?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{project.profiles?.name || '익명'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(project.created_at), {
                      addSuffix: true,
                      locale: ko
                    })}
                  </p>
                </div>
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
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium mb-4">프로젝트 설명</h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-sm"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium mb-4">댓글 ({comments.length})</h3>

              {/* Comment Form */}
              {currentUserId ? (
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
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {comment.profiles.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            {comment.profiles.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                        </div>
                        
                        {currentUserId === comment.user_id && (
                          <div className="flex gap-1">
                            {editingCommentId === comment.id ? (
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
                          </div>
                        )}
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="text-xs mt-2"
                          rows={2}
                        />
                      ) : (
                        <p className="text-xs text-foreground break-words">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </p>
                )}
              </div>
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
