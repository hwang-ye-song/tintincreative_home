import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Supabase의 or() 메서드는 괄호 없이 사용해야 함
const Portfolio = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["전체", "AI 기초", "AI 활용", "로봇"];
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const queryClient = useQueryClient();

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 사용자 정보를 React Query로 병렬 로딩 (프로젝트 데이터와 독립적으로 로드)
  // 에러가 발생해도 프로젝트 목록은 표시되도록 retry: false, 에러 무시
  const { data: userData } = useQuery<{ user: any | null; userRole: string | null }>({
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
              console.warn("Profile fetch failed:", profileError);
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
        } catch (profileError: any) {
          // profiles 테이블이나 role 컬럼이 없을 경우 null 반환 (조용히 처리)
          // 400 오류는 개발 환경에서만 경고 출력
          if (import.meta.env.DEV && profileError?.code !== 'PGRST116' && profileError?.code !== '42P01') {
            console.warn("Profile role fetch failed:", profileError);
          }
          return {
            user,
            userRole: null,
          };
        }
      } catch (error) {
        console.warn("User fetch failed:", error);
        return { user: null, userRole: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    retry: false,
    refetchOnMount: false, // 마운트 시 리페치 비활성화
    refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
  });

  const user = userData?.user ?? null;
  const userRole = userData?.userRole ?? null;

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

  const buildProjectsQuery = (pageParam: number) => {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // 다음 페이지 프리페칭 컴포넌트
  const PrefetchNextPage = ({ 
    currentPage, 
    totalPages, 
    selectedCategory, 
    searchQuery,
    queryClient 
  }: { 
    currentPage: number; 
    totalPages: number; 
    selectedCategory: string;
    searchQuery: string;
    queryClient: ReturnType<typeof useQueryClient>;
  }) => {
    const hasPrefetched = useRef(false);
    
    useEffect(() => {
      if (hasPrefetched.current || currentPage >= totalPages) return;
      
      // 다음 페이지 데이터 프리페칭
      const nextPage = currentPage + 1;
      const pageParam = nextPage - 1;
      
      queryClient.prefetchQuery({
        queryKey: [
          "projects",
          {
            page: nextPage,
            category: selectedCategory,
            search: searchQuery,
          },
        ],
        queryFn: async () => {
          const { data: projectsData, error, count } = await buildProjectsQuery(pageParam);
          
          if (error || !projectsData) {
            return { projects: [] as Project[], totalCount: 0 };
          }
          
          const cachedUserData = queryClient.getQueryData<{ user: any | null; userRole: string | null }>(["currentUser"]);
          const currentUser = cachedUserData?.user ?? null;
          const currentUserRole = cachedUserData?.userRole ?? null;
          
          let filteredProjects = projectsData.filter(matchesSearch);
          filteredProjects = filteredProjects.filter((project) => {
            if (project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false) {
              return true;
            }
            if (currentUser) {
              return project.user_id === currentUser.id || currentUserRole === "admin";
            }
            return false;
          });
          
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
          
          return {
            projects: filteredProjects.map((project) => ({
              ...project,
              commentCount: commentCounts[project.id] || 0,
              likeCount: likeCounts[project.id] || 0,
              view_count: project.view_count || 0,
            })) as Project[],
            totalCount: count || 0,
          };
        },
        staleTime: 30 * 1000,
      }).catch(() => {
        // 프리페칭 실패는 조용히 처리
      });
      
      hasPrefetched.current = true;
    }, [currentPage, totalPages, selectedCategory, searchQuery]);
    
    return null;
  };

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

  // React Query를 사용하여 프로젝트 리스트 캐싱
  const {
    data: projectsData,
    isLoading,
    isError,
  } = useQuery<{ projects: Project[]; totalCount: number }>({
    queryKey: [
      "projects",
      {
        page: currentPage,
        category: selectedCategory,
        search: searchQuery,
      },
    ],
    queryFn: async () => {
      const pageParam = currentPage - 1;
      const { data: projectsData, error, count } = await buildProjectsQuery(pageParam);

      if (error) {
        console.error("Failed to fetch projects:", error);
        return { projects: [] as Project[], totalCount: 0 };
      }

      if (!projectsData) {
        return { projects: [] as Project[], totalCount: 0 };
      }

      // 사용자 정보를 캐시에서 가져오기 (없어도 프로젝트는 표시)
      // 에러가 발생해도 프로젝트 목록은 표시되도록 안전하게 처리
      let currentUser: any | null = null;
      let currentUserRole: string | null = null;
      
      try {
        const cachedUserData = queryClient.getQueryData<{ user: any | null; userRole: string | null }>(["currentUser"]);
        currentUser = cachedUserData?.user ?? null;
        currentUserRole = cachedUserData?.userRole ?? null;
      } catch (error) {
        // 사용자 정보를 가져오지 못해도 계속 진행
        console.warn("Failed to get user data from cache:", error);
      }

      // 클라이언트 사이드 필터링 (검색)
      let filteredProjects = projectsData.filter(matchesSearch);

      // 가시성 필터링 (클라이언트 사이드) - 모든 프로젝트를 먼저 보여주고 나중에 필터링
      filteredProjects = filteredProjects.filter((project) => {
        // is_hidden이 undefined, null이거나 false면 공개로 간주
        if (project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false) {
          return true;
        }
        // 숨겨진 프로젝트는 작성자나 관리자만 볼 수 있음
        if (currentUser) {
          return project.user_id === currentUser.id || currentUserRole === "admin";
        }
        return false;
      });

      // N+1 쿼리 최적화: 프로젝트 ID 목록을 얻은 후 댓글/좋아요를 병렬로 조회
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
            commentCounts[comment.project_id] =
              (commentCounts[comment.project_id] || 0) + 1;
          });
        }

        if (likesResult.data) {
          likesResult.data.forEach((like) => {
            likeCounts[like.project_id] =
              (likeCounts[like.project_id] || 0) + 1;
          });
        }
      }

      const projectsWithCounts = filteredProjects.map((project) => ({
        ...project,
        commentCount: commentCounts[project.id] || 0,
        likeCount: likeCounts[project.id] || 0,
        view_count: project.view_count || 0,
      }));

      return {
        projects: projectsWithCounts as Project[],
        totalCount: count || 0,
      };
    },
    staleTime: 30 * 1000, // 30초 동안 캐시 유지
    retry: 1, // 실패 시 1번만 재시도
    refetchOnMount: false, // 마운트 시 리페치 비활성화
    refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
  });

  const projects = projectsData?.projects ?? [];
  const totalCount = projectsData?.totalCount ?? 0;

  // 인기 프로젝트 캐싱 (사용자 정보와 독립적으로 로드)
  const {
    data: popularData,
    isLoading: isLoadingPopular,
  } = useQuery<Project[]>({
    queryKey: ["popularProjects"],
    queryFn: async () => {
      // 캐시에서 사용자 정보 가져오기 (없어도 프로젝트는 표시)
      let currentUser: any | null = null;
      let currentUserRole: string | null = null;
      
      try {
        const cachedUserData = queryClient.getQueryData<{ user: any | null; userRole: string | null }>(["currentUser"]);
        currentUser = cachedUserData?.user ?? null;
        currentUserRole = cachedUserData?.userRole ?? null;
      } catch (error) {
        // 사용자 정보를 가져오지 못해도 계속 진행
        console.warn("Failed to get user data from cache for popular projects:", error);
      }
      
      return fetchPopularProjects(currentUser, currentUserRole);
    },
    staleTime: 120 * 1000, // 120초 동안 캐시 유지 (인기 프로젝트는 더 오래 캐시)
  });

  const popularProjects = popularData ?? [];

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
          {isLoading && !projectsData ? (
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
                
                {/* 다음 페이지 데이터 프리페칭 (마지막 3개 항목 근처에 도달하면) */}
                {currentPage < totalPages && projects.length >= 7 && (
                  <PrefetchNextPage 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                    queryClient={queryClient}
                  />
                )}
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
