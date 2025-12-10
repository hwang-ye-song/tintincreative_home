import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Trash2, Users, Sparkles, Home } from "lucide-react";
import { Project, Comment, Profile } from "@/types";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "projects";

  // 관리자 권한 확인 (React Query)
  const { data: adminCheck, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["adminCheck"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return { isAdmin: false, user: null };
      }

      // role 컬럼이 없을 수 있으므로 모든 컬럼 선택
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // 에러가 발생하거나 프로필이 없거나 role이 admin이 아니면 접근 거부
      if (profileError || !profile || (profile as { role?: string })?.role !== "admin") {
        toast({
          title: "권한 없음",
          description: "관리자만 접근할 수 있습니다.",
          variant: "destructive",
        });
        navigate("/");
        return { isAdmin: false, user: null };
      }

      return { isAdmin: true, user };
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });

  const isAdmin = adminCheck?.isAdmin || false;

  // 프로젝트 목록 가져오기 (React Query)
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["adminProjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 댓글 목록 가져오기 (React Query)
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["adminComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_comments")
        .select(`
          *,
          profiles (name, avatar_url),
          projects (title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Comment[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 사용자 목록 가져오기 (React Query)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<Profile[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 통계 가져오기 (React Query)
  const { data: stats = {
    totalProjects: 0,
    totalComments: 0,
    totalUsers: 0,
    hiddenProjects: 0,
    hiddenComments: 0,
  }, isLoading: isLoadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [projectsResult, commentsResult, usersResult, hiddenProjectsResult, hiddenCommentsResult] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("project_comments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_hidden", true),
        supabase.from("project_comments").select("*", { count: "exact", head: true }).eq("is_hidden", true),
      ]);

      return {
        totalProjects: projectsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalUsers: usersResult.count || 0,
        hiddenProjects: hiddenProjectsResult.count || 0,
        hiddenComments: hiddenCommentsResult.count || 0,
      };
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  const loading = isLoadingAdmin || isLoadingProjects || isLoadingComments || isLoadingUsers || isLoadingStats;

  const toggleProjectVisibility = async (projectId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_hidden: !currentState })
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "프로젝트가 공개되었습니다." : "프로젝트가 숨김 처리되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // 포트폴리오 페이지 캐시도 무효화
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const toggleCommentVisibility = async (commentId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("project_comments")
        .update({ is_hidden: !currentState })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "댓글이 공개되었습니다." : "댓글이 숨김 처리되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const toggleBestProject = async (projectId: string, currentState: boolean) => {
    try {
      const nextBest = !currentState;
      
      // 카테고리는 변경하지 않고 is_best만 변경
      const { error } = await supabase
        .from("projects")
        .update({ is_best: nextBest } as any)
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "BEST에서 해제되었습니다." : "BEST로 지정되었습니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "BEST 설정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const toggleFeaturedHome = async (projectId: string, currentState: boolean) => {
    try {
      const nextFeatured = !currentState;
      
      const { error } = await supabase
        .from("projects")
        .update({ is_featured_home: nextFeatured } as any)
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "홈페이지에서 제거되었습니다." : "홈페이지에 표시됩니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "홈페이지 표시 설정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "프로젝트가 삭제되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("project_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projectComments"] });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>관리자 페이지</title>
      </Helmet>
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="font-heading text-3xl font-bold">관리자 페이지</h1>
            </div>
            <p className="text-muted-foreground">사이트 전체를 관리할 수 있습니다.</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  숨김: {stats.hiddenProjects}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 댓글</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  숨김: {stats.hiddenComments}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
              <TabsTrigger value="featured">홈페이지 프로젝트</TabsTrigger>
              <TabsTrigger value="comments">댓글 관리</TabsTrigger>
              <TabsTrigger value="users">사용자 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <CardDescription>
                            작성자: {project.profiles?.name || "익명"} | 
                            {new Date(project.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={project.is_best ? "default" : "outline"}
                            onClick={() => toggleBestProject(project.id, project.is_best || false)}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {project.is_best ? "BEST 해제" : "BEST 지정"}
                          </Button>
                          <Button
                            size="sm"
                            variant={project.is_hidden ? "default" : "outline"}
                            onClick={() => toggleProjectVisibility(project.id, project.is_hidden || false)}
                          >
                            {project.is_hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                공개
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                숨김
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="mt-6">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  홈페이지에 표시할 프로젝트를 선택하세요. 최대 3개까지 선택할 수 있으며, 선택된 프로젝트는 홈페이지의 "학생 프로젝트" 섹션에 표시됩니다.
                </p>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <CardDescription>
                            작성자: {project.profiles?.name || "익명"} | 
                            {new Date(project.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={(project.is_featured_home || false) ? "default" : "outline"}
                            onClick={() => toggleFeaturedHome(project.id, project.is_featured_home || false)}
                          >
                            <Home className="mr-2 h-4 w-4" />
                            {(project.is_featured_home || false) ? "홈에서 제거" : "홈에 표시"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {comment.projects?.title || "프로젝트 없음"}
                          </CardTitle>
                          <CardDescription>
                            작성자: {comment.profiles?.name || "익명"} | 
                            {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                          <p className="text-sm mt-2">{comment.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={comment.is_hidden ? "default" : "outline"}
                            onClick={() => toggleCommentVisibility(comment.id, comment.is_hidden || false)}
                          >
                            {comment.is_hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                공개
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                숨김
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <CardDescription>
                        {user.email} | 역할: {user.role || "student"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPage;

