import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Sparkles, Search, BookOpen, Download, Calendar } from "lucide-react";
import { Project, TeachingMaterial, TeachingMaterialFile } from "@/types";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { devLog } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const CURRICULUM_CATEGORIES = [
  "전체",
  "AI 네이티브 웹",
  "챗봇 만들기",
  "컴퓨터 비전",
  "Canva AI",
  "AI Python",
  "로봇",
  "기타",
];

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "bg-blue-100 text-blue-700 border-blue-200",
  "AI 활용": "bg-purple-100 text-purple-700 border-purple-200",
  "로봇": "bg-orange-100 text-orange-700 border-orange-200",
  "Canva AI": "bg-pink-100 text-pink-700 border-pink-200",
  "AI Python": "bg-green-100 text-green-700 border-green-200",
  "기타": "bg-gray-100 text-gray-700 border-gray-200",
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (fileType?: string) => {
  if (!fileType) return "📁";
  if (fileType.includes("image")) return "🖼️";
  if (fileType.includes("video")) return "🎬";
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📊";
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📈";
  if (fileType.includes("document") || fileType.includes("word")) return "📝";
  if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️";
  return "📁";
};

// 수업자료 카드 컴포넌트
const MaterialCard = ({
  material,
  onClick,
}: {
  material: TeachingMaterial;
  onClick: () => void;
}) => {
  const fileList = Array.isArray(material.file_urls) ? material.file_urls : [];
  const catColor = CATEGORY_COLORS[material.curriculum_category] || CATEGORY_COLORS["기타"];

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge
              variant="outline"
              className={`text-[10px] font-medium border mb-1 ${catColor}`}
            >
              {material.curriculum_category}
            </Badge>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {material.title}
            </h3>
          </div>
        </div>
      </div>
      <div className="p-4">
        {material.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {material.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(material.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
          {fileList.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              <span>파일 {fileList.length}개</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isAdminOrTeacher } = useAuth();

  const [initialParams] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get("category") || "BEST",
      tag: params.get("tag") || "",
    };
  });

  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [selectedSubCategory, setSelectedSubCategory] = useState("전체");
  const [materialSubCategory, setMaterialSubCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState(initialParams.tag || "");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isError, setIsError] = useState(false);

  // 카테고리 배열 (수업자료는 선생님/관리자만)
  const baseCategories = ["BEST", "전체", "AI 기초", "AI 활용", "로봇", "기타"];
  const categories = useMemo(() => {
    return isAdminOrTeacher ? [...baseCategories, "수업자료"] : baseCategories;
  }, [isAdminOrTeacher]);

  // URL 파라미터로 카테고리 변경 시 반영
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ");
  };

  const matchesSearch = (project: any) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase().trim();
    const inTitle = project.title?.toLowerCase().includes(term);
    const inDescription = stripHtml(project.description).toLowerCase().includes(term);
    const inTags = project.tags?.some((tag: string) => tag?.toLowerCase().includes(term));
    const inUserName = (project.profiles as { name?: string } | null)?.name
      ?.toLowerCase()
      .includes(term);
    return Boolean(inTitle || inDescription || inTags || inUserName);
  };

  const buildProjectsQuery = useMemo(() => {
    return (pageParam: number) => {
      let query = supabase
        .from("projects")
        .select(`*, profiles (name, avatar_url, student_type)`, { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(1000);

      if (selectedCategory === "BEST") {
        query = query.eq("is_best", true);
      } else if (selectedCategory !== "전체" && selectedCategory !== "수업자료") {
        query = query.eq("category", selectedCategory);
      }

      return query;
    };
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedSubCategory("전체");
    setMaterialSubCategory("전체");
  }, [selectedCategory, searchQuery]);

  // 수업자료 데이터 로딩
  useEffect(() => {
    if (selectedCategory !== "수업자료") return;

    const loadMaterials = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        let query = (supabase as any)
          .from("teaching_materials")
          .select("*")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

        if (materialSubCategory !== "전체") {
          query = query.eq("curriculum_category", materialSubCategory);
        }

        const { data, error } = await query;
        if (error) throw error;

        setMaterials((data as TeachingMaterial[]) || []);
        setTotalCount((data || []).length);
      } catch (error) {
        devLog.error("Error loading materials:", error);
        setMaterials([]);
        setTotalCount(0);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, [selectedCategory, materialSubCategory]);

  // 프로젝트 데이터 로딩
  useEffect(() => {
    if (selectedCategory === "수업자료") return;

    const loadProjects = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const query = buildProjectsQuery(currentPage - 1);
        const { data: projectsData, error } = await query;

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

        let filteredProjects = projectsData.filter(matchesSearch);

        if (
          selectedCategory !== "전체" &&
          selectedCategory !== "BEST" &&
          selectedSubCategory !== "전체"
        ) {
          filteredProjects = filteredProjects.filter((project) => {
            const p = project as any;
            const itemSubCategory = p.sub_category || p.profiles?.student_type;
            return itemSubCategory === selectedSubCategory;
          });
        }

        filteredProjects = filteredProjects.filter((project) => {
          if (
            project.is_hidden === undefined ||
            project.is_hidden === null ||
            project.is_hidden === false
          ) {
            return true;
          }
          if (user) {
            return (
              project.user_id === user.id ||
              userRole === "admin" ||
              userRole === "teacher"
            );
          }
          return false;
        });

        filteredProjects.sort((a, b) => {
          if (a.is_best && !b.is_best) return -1;
          if (!a.is_best && b.is_best) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const projectIds = filteredProjects.map((p) => p.id);
        let commentCounts: Record<string, number> = {};
        let likeCounts: Record<string, number> = {};

        if (projectIds.length > 0) {
          const [commentsResult, likesResult] = await Promise.all([
            supabase.from("project_comments").select("project_id").in("project_id", projectIds),
            supabase.from("project_likes").select("project_id").in("project_id", projectIds),
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
  }, [currentPage, selectedCategory, selectedSubCategory, searchQuery, buildProjectsQuery, user, userRole]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE)), [totalCount]);

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

  const isMaterialTab = selectedCategory === "수업자료";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>포트폴리오 - 학생 프로젝트 모음</title>
        <meta
          name="description"
          content="학생들이 만든 AI와 로봇공학 프로젝트를 확인하세요. 다양한 카테고리와 태그로 검색할 수 있습니다."
        />
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

      {/* Hero */}
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

          {/* 버튼 영역 */}
          <div className="flex justify-center gap-3 mt-4 animate-fade-in flex-wrap">
            {user && !isMaterialTab && (
              <Button
                onClick={() => navigate("/portfolio/create")}
                size="sm"
                className="hover-scale shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 등록
              </Button>
            )}
            {isAdminOrTeacher && isMaterialTab && (
              <Button
                onClick={() => navigate("/portfolio/material/create")}
                size="sm"
                className="hover-scale shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                수업자료 등록
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          {/* 검색 (수업자료 탭에서는 숨김) */}
          {!isMaterialTab && (
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
          )}

          {/* 카테고리 필터 */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`hover-scale transition-all text-sm ${
                    category === "수업자료"
                      ? "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                  size="sm"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {category === "수업자료" && <BookOpen className="mr-1.5 h-3.5 w-3.5" />}
                  {category}
                </Button>
              ))}
            </div>

            {/* 서브 카테고리 - 프로젝트 탭 */}
            {["AI 기초", "AI 활용", "로봇", "기타"].includes(selectedCategory) && (
              <div className="flex flex-wrap justify-center gap-2 animate-fade-in mt-2 bg-muted/50 p-2 rounded-full border border-border">
                {["전체", "초등", "중등", "일반"].map((subCat) => (
                  <Button
                    key={`sub-${subCat}`}
                    size="sm"
                    onClick={() => setSelectedSubCategory(subCat)}
                    variant={selectedSubCategory === subCat ? "default" : "ghost"}
                    className={`rounded-full transition-colors ${
                      selectedSubCategory === subCat
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10 text-muted-foreground"
                    }`}
                  >
                    {subCat}
                  </Button>
                ))}
              </div>
            )}

            {/* 서브 카테고리 - 수업자료 탭 */}
            {isMaterialTab && (
              <div className="flex flex-wrap justify-center gap-2 animate-fade-in mt-2 bg-muted/50 p-2 rounded-xl border border-border">
                {CURRICULUM_CATEGORIES.map((subCat) => (
                  <Button
                    key={`mat-${subCat}`}
                    size="sm"
                    onClick={() => setMaterialSubCategory(subCat)}
                    variant={materialSubCategory === subCat ? "default" : "ghost"}
                    className={`rounded-full transition-colors text-xs ${
                      materialSubCategory === subCat
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
            {isMaterialTab
              ? `수업자료${materialSubCategory !== "전체" ? ` - ${materialSubCategory}` : ""}`
              : selectedCategory === "BEST"
              ? "BEST 프로젝트"
              : selectedCategory === "전체"
              ? "모든 프로젝트"
              : `${selectedCategory} 프로젝트`}
          </h2>

          {/* 수업자료 목록 */}
          {isMaterialTab ? (
            isLoading ? (
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">수업자료를 불러오는 중 오류가 발생했습니다.</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg text-muted-foreground">이 카테고리에 수업자료가 없습니다</p>
                {isAdminOrTeacher && (
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => navigate("/portfolio/material/create")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    수업자료 등록하기
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material, index) => (
                  <div
                    key={material.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MaterialCard
                      material={material}
                      onClick={() => navigate(`/portfolio/material/${material.id}`)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            /* 프로젝트 목록 */
            <>
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
                          if (e.key === "Enter" || e.key === " ") {
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
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolio;
