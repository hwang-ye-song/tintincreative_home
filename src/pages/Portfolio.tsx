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
import type { User } from "@supabase/supabase-js";
import { devLog } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Supabase의 or() 메서드는 괄호 없이 사용해야 함
const Portfolio = () => {
  const navigate = useNavigate();
  const [initialParams] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') || 'BEST',
      tag: params.get('tag') || ''
    };
  });
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState(initialParams.tag || "");
  const categories = ["BEST", "전체", "AI 기초", "AI 활용", "로봇", "기타"];
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user, userRole } = useAuth();
  const [isError, setIsError] = useState(false);

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 즉시 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // useAuth 훅이 인증 상태를 관리하므로 별도의 useEffect 불필요

  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ");
  };

  const matchesSearch = (project: any) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase().trim();
    const inTitle = project.title?.toLowerCase().includes(term);
    const inDescription = stripHtml(project.description).toLowerCase().includes(term);
    const inTags = project.tags?.some(tag => tag?.toLowerCase().includes(term));
    const inUserId = project.user_id?.toLowerCase().includes(term);
    const inUserName = (project.profiles as { name?: string } | null)?.name?.toLowerCase().includes(term);
    return Boolean(inTitle || inDescription || inTags || inUserId || inUserName);
  };

  const buildProjectsQuery = useMemo(() => {
    return (pageParam: number) => {
      // 페이지네이션을 위해 더 많은 데이터를 가져옴 (클라이언트 사이드에서 정렬 및 페이지네이션)
      let query = supabase
        .from("projects")
        .select(
          `
          *,
          profiles (name, avatar_url, student_type)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .limit(1000); // 충분한 데이터를 가져옴

      if (selectedCategory === "BEST") {
        query = query.eq("is_best", true);
      } else if (selectedCategory !== "전체") {
        query = query.eq("category", selectedCategory);
      }

      return query;
    };
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedSubCategory("전체"); // 메인 카테고리가 변경되면 서브 카테고리를 초기화
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
          devLog.error("Failed to fetch projects:", error);
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

        // 현재 사용자 정보는 useAuth 훅에서 가져옴
        const currentUser = user;
        const currentUserRole = userRole;

        // 클라이언트 사이드 필터링 (검색)
        let filteredProjects = projectsData.filter(matchesSearch);

        // 하위 카테고리 필터링 (작성 시 선택한 project.sub_category 우선 기반)
        if (selectedCategory !== "전체" && selectedCategory !== "BEST" && selectedSubCategory !== "전체") {
          filteredProjects = filteredProjects.filter(project => {
            const p = project as any;
            const itemSubCategory = p.sub_category || p.profiles?.student_type;
            return itemSubCategory === selectedSubCategory;
          });
        }

        // 가시성 필터링
        filteredProjects = filteredProjects.filter((project) => {
          if (project.is_hidden === undefined || project.is_hidden === null || project.is_hidden === false) {
            return true;
          }
          if (currentUser) {
            return project.user_id === currentUser.id || currentUserRole === "admin" || currentUserRole === "teacher";
          }
          return false;
        });

        // BEST 프로젝트를 최상단에 배치하고, 그 다음 최신순으로 정렬
        filteredProjects.sort((a, b) => {
          // BEST 프로젝트를 먼저
          if (a.is_best && !b.is_best) return -1;
          if (!a.is_best && b.is_best) return 1;
          // 둘 다 BEST이거나 둘 다 아닌 경우, 최신순으로 정렬
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

        // 페이지네이션 적용 (정렬 후)
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

        const projectsWithCounts = paginatedProjects.map((project) => ({
          ...project,
          commentCount: commentCounts[project.id] || 0,
          likeCount: likeCounts[project.id] || 0,
          view_count: project.view_count || 0,
        })) as Project[];

        setProjects(projectsWithCounts);
        // 필터링된 전체 개수로 설정
        setTotalCount(filteredProjects.length);
      } catch (error) {
        devLog.error("Error loading projects:", error);
        setProjects([]);
        setTotalCount(0);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [currentPage, selectedCategory, selectedSubCategory, searchQuery, buildProjectsQuery]);



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
        <meta property="og:image" content={`${window.location.origin}/images/og_image_one.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${window.location.origin}/images/og_image_one.png`} />
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

          {/* Category Filter */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-3">
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

            {/* Sub Category Filter (태그 기반 필터링) */}
            {["AI 기초", "AI 활용", "로봇", "기타"].includes(selectedCategory) && (
              <div className="flex flex-wrap justify-center gap-2 animate-fade-in mt-2 bg-muted/50 p-2 rounded-full border border-border">
                {["전체", "초등", "중등", "일반"].map((subCat) => (
                  <Button
                    key={`sub-${subCat}`}
                    size="sm"
                    onClick={() => setSelectedSubCategory(subCat)}
                    variant={selectedSubCategory === subCat ? "default" : "ghost"}
                    className={`rounded-full transition-colors ${selectedSubCategory === subCat
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10 text-muted-foreground"
                      }`}
                  >
                    {subCat}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <h2 className="font-heading text-sm md:text-base font-semibold mb-4 text-center max-w-7xl mx-auto">
            {selectedCategory === "BEST" ? "BEST 프로젝트" : selectedCategory === "전체" ? "모든 프로젝트" : `${selectedCategory} 프로젝트`}
          </h2>

          {/* Projects List */}
          {isLoading ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
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
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/portfolio/${project.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/portfolio/${project.id}`);
                      }
                    }}
                    className="cursor-pointer animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${project.title || "제목 없음"} 프로젝트 보기`}
                  >
                    <PortfolioCard
                      id={project.id}
                      title={project.title || "제목 없음"}
                      student={project.profiles?.name || "익명"}
                      description={project.description || ""}
                      category={project.category || "기타"}
                      tags={project.tags || []}
                      commentCount={project.commentCount || 0}
                      likeCount={project.likeCount || 0}
                      viewCount={project.view_count || 0}
                      avatarUrl={project.profiles?.avatar_url || null}
                      imageUrl={project.image_url || null}
                      videoUrl={project.video_url || null}
                      isBest={project.is_best || false}
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
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
