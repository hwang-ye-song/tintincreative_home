import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Trash2, Users, BarChart3 } from "lucide-react";
import { Project, Comment, Profile } from "@/types";
import { Helmet } from "react-helmet-async";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalComments: 0,
    totalUsers: 0,
    hiddenProjects: 0,
    hiddenComments: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "권한 없음",
          description: "관리자만 접근할 수 있습니다.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await Promise.all([
        fetchProjects(),
        fetchComments(),
        fetchUsers(),
        fetchStats(),
      ]);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "접근 권한을 확인하는데 실패했습니다.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles (name)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setProjects(data as Project[]);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("project_comments")
      .select(`
        *,
        profiles (name),
        projects (title)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setUsers(data as Profile[]);
    }
  };

  const fetchStats = async () => {
    const [projectsResult, commentsResult, usersResult, hiddenProjectsResult, hiddenCommentsResult] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("project_comments").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_hidden", true),
      supabase.from("project_comments").select("*", { count: "exact", head: true }).eq("is_hidden", true),
    ]);

    setStats({
      totalProjects: projectsResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalUsers: usersResult.count || 0,
      hiddenProjects: hiddenProjectsResult.count || 0,
      hiddenComments: hiddenCommentsResult.count || 0,
    });
  };

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

      await Promise.all([fetchProjects(), fetchStats()]);
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

      await Promise.all([fetchComments(), fetchStats()]);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "댓글 상태 변경에 실패했습니다.",
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
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
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

