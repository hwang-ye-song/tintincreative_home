import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Trash2, Users, Sparkles, Home, Search } from "lucide-react";
import { Project, Comment, Profile } from "@/types";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { devLog } from "@/lib/utils";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "projects";
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [adminPasswordDialog, setAdminPasswordDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({ open: false, userId: null, userName: null });
  const [adminPassword, setAdminPassword] = useState("");
  const ADMIN_PROMOTION_PASSWORD = "051414";

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

      const userRole = (profile as { role?: string })?.role;
      // 에러가 발생하거나 프로필이 없거나 role이 admin 또는 teacher가 아니면 접근 거부
      if (profileError || !profile || (userRole !== "admin" && userRole !== "teacher")) {
        toast({
          title: "권한 없음",
          description: "관리자 또는 선생님만 접근할 수 있습니다.",
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
        .limit(200); // 검색을 위해 더 많은 데이터 가져오기

      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 사용자 검색 필터링
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      return users;
    }
    const query = userSearchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [users, userSearchQuery]);

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "BEST 설정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "홈페이지 표시 설정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (userId: string, userName: string, newRole: "admin" | "teacher" | "student", currentRole: string) => {
    // 자기 자신의 역할은 변경할 수 없음
    if (adminCheck?.user?.id === userId) {
      toast({
        title: "오류",
        description: "자기 자신의 역할은 변경할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 관리자로 승격하는 경우 비밀번호 확인 필요
    if (newRole === "admin" && currentRole !== "admin") {
      setAdminPasswordDialog({ open: true, userId, userName });
      setAdminPassword("");
      return;
    }

    // 학생 → 선생님 또는 다른 역할 변경은 바로 실행
    updateUserRole(userId, newRole);
  };

  const confirmAdminPromotion = async () => {
    if (adminPassword !== ADMIN_PROMOTION_PASSWORD) {
      toast({
        title: "오류",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (adminPasswordDialog.userId) {
      await updateUserRole(adminPasswordDialog.userId, "admin");
      setAdminPasswordDialog({ open: false, userId: null, userName: null });
      setAdminPassword("");
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "teacher" | "student") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole } as any)
        .eq("id", userId);

      if (error) {
        devLog.error("Role update error:", error);
        throw error;
      }

      const roleNames = {
        admin: "관리자",
        teacher: "선생님",
        student: "학생",
      };

      toast({
        title: "성공",
        description: `사용자 역할이 ${roleNames[newRole]}로 변경되었습니다.`,
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "사용자 역할 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
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
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="이름 또는 이메일로 검색..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {userSearchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredUsers.length}명의 사용자를 찾았습니다.
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {userSearchQuery ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.map((user) => {
                    const currentRole = (user.role || "student") as "admin" | "teacher" | "student";
                    const isCurrentUser = adminCheck?.user?.id === user.id;
                    
                    return (
                      <Card key={user.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{user.name || "이름 없음"}</CardTitle>
                              <CardDescription className="mt-1">
                                {user.email || "이메일 없음"}
                              </CardDescription>
                            </div>
                            <div className="ml-4">
                              <Select
                                value={currentRole}
                                onValueChange={(value: "admin" | "teacher" | "student") => {
                                  handleRoleChange(user.id, user.name || "사용자", value, currentRole);
                                }}
                                disabled={isCurrentUser}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue>
                                    {currentRole === "admin" ? "관리자" : currentRole === "teacher" ? "선생님" : "학생"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">학생</SelectItem>
                                  <SelectItem value="teacher">선생님</SelectItem>
                                  <SelectItem value="admin">관리자</SelectItem>
                                </SelectContent>
                              </Select>
                              {isCurrentUser && (
                                <p className="text-xs text-muted-foreground mt-1 text-center">
                                  (본인)
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 관리자 승격 비밀번호 확인 다이얼로그 */}
      <Dialog open={adminPasswordDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAdminPasswordDialog({ open: false, userId: null, userName: null });
          setAdminPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 승격 확인</DialogTitle>
            <DialogDescription>
              {adminPasswordDialog.userName}님을 관리자로 승격하려면 비밀번호를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmAdminPromotion();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdminPasswordDialog({ open: false, userId: null, userName: null });
                setAdminPassword("");
              }}
            >
              취소
            </Button>
            <Button onClick={confirmAdminPromotion}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminPage;

