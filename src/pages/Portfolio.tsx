import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Sparkles, Search } from "lucide-react";
import { Project } from "@/types";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";

// Supabase의 or() 메서드는 괄호 없이 사용해야 함
const Portfolio = () => {
  const navigate = useNavigate();
  const [initialParams] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') || '전체',
      tag: params.get('tag') || ''
    };
  });
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [searchQuery, setSearchQuery] = useState(initialParams.tag || "");
  const categories = ["전체", "AI 기초", "AI 활용", "로봇"];
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [projects, setProjects] = useState<Project[]>([]);
  const [popularProjects, setPopularProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 사용자 정보 가져오기 (간단하게)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            setUserRole(profile?.role || null);
          } catch {
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch {
        setUser(null);
        setUserRole(null);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserRole(profile?.role || null);
          })
          .catch(() => setUserRole(null));
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ");
  };

  const matchesSearch = (project: { title?: string | null; description?: string | null; tags?: string[] | null }) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const inTitle = project.title?.toLowerCase().includes(term);
    const inDescription = stripHtml(project.description).toLowerCase().includes(term);
    const inTags = project.tags?.some(tag => tag?.toLowerCase().includes(term));
    return Boolean(inTitle || inDescription || inTags);
  };

  const buildProjectsQuery = useMemo(() => {
    return (pageParam: number) => {
      let query = supabase
        .from("projects")
        .select(
          `
          *,
          profiles (name, avatar_url)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (selectedCategory !== "전체") {
        query = query.eq("category", selectedCategory);
      }

      return query;
    };
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // 프로젝트 데이터 가져오기 (간단하게)
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const pageParam = currentPage - 1;
        const query = buildProjectsQuery(pageParam);
        const { data: projectsData, error, count } = await query;

        if (error) {
          console.error("Failed to fetch projects:", error);
          setProjects([]);
          setTotalCount(0);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        if (!projectsData) {
          setProjects([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        // 현재 사용자 정보 가져오기 (필요할 때만)
        let currentUser: any | null = null;
        let currentUserRole: string | null = null;
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            currentUser = session.user;
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              currentUserRole = profile?.role || null;
            } catch {
              currentUserRole = null;
            }
          }
        } catch {
          // 사용자 정보 가져오기 실패 시 무시
        }

        // 클라이언트 사이드 필터링 (검색)
        let filteredProjects = projectsData.filter(matchesSearch);

        // 가시성 필터링
        filteredProjects = filteredProjects.filter((project) => {
          if (project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false) {
            return true;
          }
          if (currentUser) {
            return project.user_id === currentUser.id || currentUserRole === "admin";
          }
          return false;
        });

        // 댓글/좋아요 수 가져오기
        const projectIds = filteredProjects.map((p) => p.id);
        let commentCounts: Record<string, number> = {};
        let likeCounts: Record<string, number> = {};

        if (projectIds.length > 0) {
          const [commentsResult, likesResult] = await Promise.all([
            supabase
              .from("project_comments")
              .select("project_id")
              .in("project_id", projectIds),
            supabase
              .from("project_likes")
              .select("project_id")
              .in("project_id", projectIds),
          ]);

          if (commentsResult.data) {
            commentsResult.data.forEach((comment) => {
              commentCounts[comment.project_id] = (commentCounts[comment.project_id] || 0) + 1;
            });
          }

          if (likesResult.data) {
            likesResult.data.forEach((like) => {
              likeCounts[like.project_id] = (likeCounts[like.project_id] || 0) + 1;
            });
          }
        }

        const projectsWithCounts = filteredProjects.map((project) => ({
          ...project,
          commentCount: commentCounts[project.id] || 0,
          likeCount: likeCounts[project.id] || 0,
          view_count: project.view_count || 0,
        })) as Project[];

        setProjects(projectsWithCounts);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
        setTotalCount(0);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [currentPage, selectedCategory, searchQuery, buildProjectsQuery]);

  // 인기 프로젝트 가져오기
  useEffect(() => {
    const loadPopularProjects = async () => {
      setIsLoadingPopular(true);
      try {
        const result = await fetchPopularProjects(user, userRole);
        setPopularProjects(result);
      } catch (error) {
        console.error("Error loading popular projects:", error);
        setPopularProjects([]);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularProjects();
  }, [user, userRole]);

  const fetchPopularProjects = async (currentUser?: any, currentUserRole?: string | null) => {
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles (name, avatar_url)
      `)
      .order("view_count", { ascending: false })
      .limit(20); // 더 많이 가져와서 필터링

    if (error) {
      console.error("Failed to fetch popular projects:", error);
      return [];
    }

    if (!projectsData) {
      return [];
    }

    // 작성자이거나 관리자인 경우 숨겨진 프로젝트도 포함
    let filteredProjects = projectsData;
    if (currentUser) {
      filteredProjects = filteredProjects.filter((project) => {
        // is_hidden이 undefined, null이거나 false면 공개
        if (project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false) {
          return true;
        }
        // 숨겨진 프로젝트는 작성자나 관리자만 볼 수 있음
        return project.user_id === currentUser.id || currentUserRole === "admin";
      });
    } else {
      filteredProjects = filteredProjects.filter((project) => 
        project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false
      );
    }
    
    // 상위 3개만 선택
    filteredProjects = filteredProjects.slice(0, 3);
      
      // N+1 쿼리 최적화: 프로젝트 ID 목록을 얻은 후 댓글/좋아요를 병렬로 조회
      const projectIds = filteredProjects.map(p => p.id);
      
      let commentCounts: Record<string, number> = {};
      let likeCounts: Record<string, number> = {};
      
      if (projectIds.length > 0) {
        // 댓글과 좋아요를 병렬로 조회
        const [commentsResult, likesResult] = await Promise.all([
          supabase
            .from('project_comments')
            .select('project_id')
            .in('project_id', projectIds),
          supabase
            .from('project_likes')
            .select('project_id')
            .in('project_id', projectIds)
        ]);
        
        if (commentsResult.data) {
          commentsResult.data.forEach(comment => {
            commentCounts[comment.project_id] = (commentCounts[comment.project_id] || 0) + 1;
          });
        }
        
        if (likesResult.data) {
          likesResult.data.forEach(like => {
            likeCounts[like.project_id] = (likeCounts[like.project_id] || 0) + 1;
          });
        }
      }
      
      const projectsWithCounts = filteredProjects.map((project) => ({
        ...project,
        commentCount: commentCounts[project.id] || 0,
        likeCount: likeCounts[project.id] || 0,
        view_count: project.view_count || 0
      }));
      
      return projectsWithCounts;
  };


  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE)),
    [totalCount]
  );

  const getPageNumbers = () => {
    const maxButtons = 5;
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>포트폴리오 - 학생 프로젝트 모음</title>
        <meta name="description" content="학생들이 만든 AI와 로봇공학 프로젝트를 확인하세요. 다양한 카테고리와 태그로 검색할 수 있습니다." />
        <meta property="og:title" content="포트폴리오 - 학생 프로젝트 모음" />
        <meta property="og:description" content="학생들이 만든 AI와 로봇공학 프로젝트를 확인하세요" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      
      {/* Hero Header Section */}
      <div className="relative pt-24 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Student Showcase</span>
            </div>
            <h1 className="font-heading text-xl md:text-2xl font-bold bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              학생 프로젝트
            </h1>
          </div>

          {/* Add Project Button */}
          {user && (
            <div className="flex justify-center mt-4 animate-fade-in">
              <Button 
                onClick={() => navigate("/portfolio/create")} 
                size="sm"
                className="hover-scale shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 등록
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="제목, 설명, 태그로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Popular Projects Section */}
          <div className="mb-12 max-w-4xl mx-auto animate-fade-in">
            <h2 className="font-heading text-base md:text-lg font-bold mb-4 text-center">
              🔥 인기 프로젝트
            </h2>
            {isLoadingPopular ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : popularProjects.length > 0 ? (
              <div className="space-y-3">
                {popularProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/portfolio/${project.id}`)}
                    className="cursor-pointer"
                  >
                    <PortfolioCard
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      category={project.category || "기타"}
                      tags={project.tags || []}
                      student={project.profiles?.name || "익명"}
                      commentCount={project.commentCount || 0}
                      likeCount={project.likeCount || 0}
                      viewCount={project.view_count || 0}
                      avatarUrl={project.profiles?.avatar_url || null}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="hover-scale transition-all text-sm"
                size="sm"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {category}
              </Button>
            ))}
          </div>

          <h2 className="font-heading text-sm md:text-base font-semibold mb-4 text-center max-w-4xl mx-auto">
            모든 프로젝트
          </h2>

          {/* Projects List */}
          {isLoading ? (
            <div className="max-w-4xl mx-auto space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg text-muted-foreground">
                프로젝트를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="max-w-4xl mx-auto space-y-3">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/portfolio/${project.id}`)}
                    className="cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PortfolioCard
                      id={project.id}
                      title={project.title}
                      student={project.profiles?.name || "익명"}
                      description={project.description}
                      category={project.category || "기타"}
                      tags={project.tags || []}
                      commentCount={project.commentCount || 0}
                      likeCount={project.likeCount || 0}
                      viewCount={project.view_count || 0}
                      avatarUrl={project.profiles?.avatar_url || null}
                    />
                  </div>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg text-muted-foreground">
                    이 카테고리에 프로젝트가 없습니다
                  </p>
                </div>
              )}

              {projects.length > 0 && totalPages >= 1 && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolio;
