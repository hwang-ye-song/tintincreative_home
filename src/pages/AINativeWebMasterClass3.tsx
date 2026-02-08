import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { PortfolioCard } from "@/components/PortfolioCard";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { devLog } from "@/lib/utils";

const AINativeWebMasterClass3 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [sectionTexts, setSectionTexts] = useState({
    badge: "Student Projects",
    title: "관련 학생 프로젝트",
    description: "이 커리큘럼을 수강한 학생들의 프로젝트를 확인해보세요"
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isEditingTexts, setIsEditingTexts] = useState(false);
  const [isSavingTexts, setIsSavingTexts] = useState(false);
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [projectInput, setProjectInput] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 관리자 여부 확인
  useEffect(() => {
    const checkAdmin = async () => {
      setIsCheckingAdmin(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        const role = (profile as { role?: string })?.role;
        setIsAdmin(role === "admin" || role === "teacher");
      } catch (error) {
        devLog.error("Failed to check admin:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // 섹션 텍스트 가져오기
  useEffect(() => {
    const loadSectionTexts = async () => {
      try {
        const { data, error } = await supabase
          .from("curriculums")
          .select("projects_section_badge, projects_section_title, projects_section_description")
          .eq("id", "application-3")
          .single();

        if (!error && data) {
          setSectionTexts({
            badge: data.projects_section_badge || "Student Projects",
            title: data.projects_section_title || "관련 학생 프로젝트",
            description: data.projects_section_description || "이 커리큘럼을 수강한 학생들의 프로젝트를 확인해보세요"
          });
        }
      } catch (error) {
        devLog.error("Failed to load section texts:", error);
      }
    };

    loadSectionTexts();
  }, []);

  // 섹션 텍스트 저장
  const saveSectionTexts = async () => {
    setIsSavingTexts(true);
    try {
      const { error } = await supabase
        .from("curriculums")
        .update({
          projects_section_badge: sectionTexts.badge,
          projects_section_title: sectionTexts.title,
          projects_section_description: sectionTexts.description,
        })
        .eq("id", "application-3");

      if (error) {
        devLog.error("Failed to save section texts:", error);
        alert("저장에 실패했습니다.");
        return;
      }

      alert("저장되었습니다.");
      setIsEditingTexts(false);
    } catch (error) {
      devLog.error("Failed to save section texts:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSavingTexts(false);
    }
  };

  // 공용 프로젝트 로더
  const fetchRelatedProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const { data: curriculumProjects, error: curriculumError } = await supabase
        .from("curriculum_projects")
        .select(`
          project_id,
          display_order
        `)
        .eq("curriculum_id", "application-3")
        .order("display_order", { ascending: true });

      if (curriculumError) {
        devLog.error("Failed to fetch curriculum projects:", curriculumError);
      }

      let projectsData: Project[] = [];

      if (!curriculumProjects || curriculumProjects.length === 0) {
        setRelatedProjects([]);
        return;
      }

      const projectIds = curriculumProjects.map((cp) => cp.project_id);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .in("id", projectIds)
        .eq("is_hidden", false);

      if (error) throw error;

      if (data) {
        const projectMap = new Map(data.map((p) => [p.id, p]));
        projectsData = curriculumProjects
          .map((cp) => projectMap.get(cp.project_id))
          .filter((p) => p !== undefined) as any[];
      }

      if (!projectsData || projectsData.length === 0) {
        setRelatedProjects([]);
        return;
      }

      const projectIdsForCounts = projectsData.map((p) => p.id);
      let commentCounts: Record<string, number> = {};
      let likeCounts: Record<string, number> = {};

      if (projectIdsForCounts.length > 0) {
        const [commentsResult, likesResult] = await Promise.all([
          supabase.from("project_comments").select("project_id").in("project_id", projectIdsForCounts),
          supabase.from("project_likes").select("project_id").in("project_id", projectIdsForCounts),
        ]);

        commentsResult.data?.forEach((comment) => {
          commentCounts[comment.project_id] = (commentCounts[comment.project_id] || 0) + 1;
        });

        likesResult.data?.forEach((like) => {
          likeCounts[like.project_id] = (likeCounts[like.project_id] || 0) + 1;
        });
      }

      const projectsWithCounts = projectsData.map((project) => ({
        ...project,
        commentCount: commentCounts[project.id] || 0,
        likeCount: likeCounts[project.id] || 0,
        view_count: project.view_count || 0,
      })) as Project[];

      setRelatedProjects(projectsWithCounts);
    } catch (error) {
      devLog.error("Error loading related projects:", error);
      setRelatedProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchRelatedProjects();
  }, []);

  // 프로젝트 추가
  const addProjectToCurriculum = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("curriculum_projects")
        .insert({
          curriculum_id: "application-3",
          project_id: projectId,
          display_order: relatedProjects.length,
        });

      if (error) throw error;

      toast({ title: "성공", description: "프로젝트가 추가되었습니다." });
      setShowProjectSelector(false);
      await fetchRelatedProjects();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 추가에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // 프로젝트 제거
  const removeProjectFromCurriculum = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("curriculum_projects")
        .delete()
        .eq("curriculum_id", "application-3")
        .eq("project_id", projectId);

      if (error) throw error;

      toast({ title: "성공", description: "프로젝트가 제거되었습니다." });
      await fetchRelatedProjects();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 제거에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // 순서 변경
  const updateProjectOrder = async (projectId: string, targetIndex: number) => {
    if (isUpdatingOrder) return;
    setIsUpdatingOrder(true);
    try {
      const newList = [...relatedProjects];
      const currentIndex = newList.findIndex((p) => p.id === projectId);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= newList.length) return;
      const [moved] = newList.splice(currentIndex, 1);
      newList.splice(targetIndex, 0, moved);
      setRelatedProjects(newList);

      await Promise.all(
        newList.map((p, idx) =>
          supabase
            .from("curriculum_projects")
            .update({ display_order: idx })
            .eq("curriculum_id", "application-3")
            .eq("project_id", p.id)
        )
      );
      // 최신 순서 재확인
      await fetchRelatedProjects();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "순서 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
      fetchRelatedProjects();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // URL 또는 ID로 프로젝트 추가
  const addProjectByInput = async () => {
    const raw = projectInput.trim();
    if (!raw) {
      toast({ title: "입력 필요", description: "프로젝트 URL 또는 ID를 입력하세요.", variant: "destructive" });
      return;
    }

    // URL에서 ID 추출
    let projectId = raw;
    try {
      if (raw.includes("/")) {
        const url = new URL(raw, window.location.origin);
        const parts = url.pathname.split("/").filter(Boolean);
        projectId = parts[parts.length - 1];
      }
      projectId = projectId.split("?")[0].split("#")[0];
    } catch {
      // URL 파싱 실패 시 그대로 사용
    }

    if (!projectId) {
      toast({ title: "잘못된 입력", description: "프로젝트 ID를 확인하세요.", variant: "destructive" });
      return;
    }

    // 중복 체크
    if (relatedProjects.some((p) => p.id === projectId)) {
      toast({ title: "이미 추가됨", description: "이미 연결된 프로젝트입니다." });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles (name, avatar_url)")
        .eq("id", projectId)
        .eq("is_hidden", false)
        .single();

      if (error || !data) {
        toast({ title: "찾을 수 없음", description: "프로젝트가 존재하지 않거나 숨김 상태입니다.", variant: "destructive" });
        return;
      }

      await addProjectToCurriculum(projectId);
      setProjectInput("");
      setShowProjectInput(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트를 추가할 수 없습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Realize Academy - AI Native Web Master Class</title>
        <meta name="description" content="디자인 툴 없이, AI와 바이브 코딩으로 4주 만에 완성합니다. AI Native Web Development" />
      </Helmet>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          background-color: #ffffff;
          color: #1e293b;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
        }
        h1, h2, h3, h4 {
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        h1 { font-size: 56px; line-height: 1.2; font-weight: 800; margin-bottom: 24px; }
        h2 { font-size: 40px; font-weight: 700; margin-bottom: 16px; }
        h3 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
        p { font-size: 18px; line-height: 1.7; color: #475569; font-weight: 400; }
        .text-brand { color: #00AFFF; }
        .bg-light { background-color: #f8fafc; }
        .bg-brand-light { background-color: #f0f9ff; }
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }
        .section {
          padding: 100px 0;
          position: relative;
        }
        .tag-badge {
          background: #e0f2fe;
          color: #0077cc;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 20px;
        }
        header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid #e2e8f0;
        }
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        .logo {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          text-decoration: none;
        }
        .logo span { color: #00AFFF; }
        .nav-links {
          display: flex;
          gap: 32px;
        }
        .nav-links a {
          text-decoration: none;
          color: #64748b;
          font-weight: 600;
          font-size: 16px;
          transition: color 0.3s;
        }
        .nav-links a:hover { color: #00AFFF; }
        .nav-cta {
          background: #00AFFF;
          color: #fff;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
        }
        .nav-cta:hover { background: #008ecc; }
        #hero {
          padding-top: 160px;
          padding-bottom: 80px;
          background: linear-gradient(to bottom, #f0f9ff, #ffffff);
        }
        .hero-content {
          display: flex;
          flex-direction: row;
          gap: 20px;
          align-items: center;
          flex-wrap: nowrap;
        }
        .hero-text {
          flex: 1.2;
          min-width: 0;
        }
        .hero-text .main-desc {
          font-size: 20px;
          color: #334155;
          margin-bottom: 40px;
        }
        .hero-img-box {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hero-img-box img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
          background: #fff;
          object-fit: contain;
        }
        .hero-note {
          margin-top: 20px;
          font-size: 14px;
          color: #64748b;
        }
        @media (max-width: 992px) {
          .hero-content {
            gap: 20px;
          }
          .hero-text {
            flex: 1.1;
          }
          .hero-text .main-desc {
            font-size: 18px;
            margin-bottom: 30px;
          }
        }
        @media (max-width: 768px) {
          .hero-content {
            gap: 15px;
          }
          .hero-text {
            flex: 1;
          }
          .hero-text .main-desc {
            font-size: 15px;
            margin-bottom: 20px;
          }
          .main-btn {
            font-size: 16px;
            padding: 14px 28px;
          }
          .hero-note {
            font-size: 11px;
            margin-top: 12px;
          }
          h1 {
            font-size: 28px !important;
            margin-bottom: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-content {
            gap: 10px;
          }
          .hero-text {
            flex: 0.9;
          }
          .hero-img-box {
            flex: 1;
          }
          .hero-text .main-desc {
            font-size: 12px;
            margin-bottom: 16px;
            line-height: 1.5;
          }
          .main-btn {
            font-size: 14px;
            padding: 12px 24px;
          }
          .hero-note {
            font-size: 10px;
            margin-top: 10px;
          }
          h1 {
            font-size: 20px !important;
            margin-bottom: 12px !important;
            line-height: 1.3 !important;
          }
          .tag-badge {
            font-size: 10px;
            padding: 4px 8px;
            margin-bottom: 12px;
          }
        }
        #necessity {
          background-color: #fff;
          padding-bottom: 80px;
        }
        .necessity-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 50px auto;
        }
        .use-case-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .use-case-card {
          background: #f8fafc;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease;
          border: 1px solid #e2e8f0;
          padding: 30px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .use-case-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          border-color: #00AFFF;
        }
        .use-case-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .bg-uc-1 { background: #e0f2fe; color: #00AFFF; }
        .bg-uc-2 { background: #f3e8ff; color: #7B61FF; }
        .bg-uc-3 { background: #ffedd5; color: #f97316; }
        .use-case-content h4 {
          font-size: 18px;
          margin-bottom: 10px;
          font-weight: 800;
        }
        .use-case-content p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 0;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 40px;
        }
        .feature-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 24px;
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          height: 100%;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #00AFFF;
        }
        .icon-circle {
          width: 44px;
          height: 44px;
          background: #f0f9ff;
          color: #00AFFF;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 16px;
        }
        .feature-card h3 {
          font-size: 18px;
          margin-bottom: 12px;
          font-weight: 800;
        }
        .feature-card p {
          font-size: 15px;
          line-height: 1.5;
          color: #64748b;
        }
        .feature-card strong {
          color: #0f172a;
        }
        .curriculum-wrapper {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 40px;
        }
        .curr-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }
        .track-divider {
          display: flex;
          align-items: center;
          margin: 30px 0 15px 0;
          color: #94a3b8;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
        }
        .track-divider::before, .track-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .track-divider span { padding: 0 15px; background: #fff; }
        .track-row {
          display: grid;
          gap: 20px;
          margin-bottom: 30px;
        }
        .cols-2 { grid-template-columns: repeat(2, 1fr); }
        .cols-3 { grid-template-columns: repeat(3, 1fr); }
        .week-item {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          height: 100%;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .week-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: #00AFFF;
        }
        .tech-stack-box {
          margin-top: auto;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tech-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #64748b;
          font-weight: 600;
        }
        .type-badge {
          position: absolute;
          top: 0;
          right: 0;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          border-bottom-left-radius: 8px;
        }
        .type-fe { background: #e0f2fe; color: #00AFFF; }
        .type-be { background: #f3e8ff; color: #7B61FF; }
        .type-ops { background: #ecfdf5; color: #10b981; }
        .week-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          width: fit-content;
        }
        .week-badge.pro {
          background: #e0f2fe;
          color: #00AFFF;
        }
        .tech-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .code-window {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
          font-family: 'Courier New', monospace;
          color: #e2e8f0;
          font-size: 14px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .check-list {
          list-style: none;
          margin-top: 24px;
        }
        .check-list li {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #334155;
        }
        .check-list i {
          color: #00AFFF;
          margin-right: 12px;
        }
        .pro-box {
          background: linear-gradient(135deg, #00AFFF 0%, #0077cc 100%);
          border-radius: 20px;
          padding: 60px;
          color: #fff;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 175, 255, 0.2);
        }
        .pro-box h2, .pro-box p { color: #fff; }
        .pro-features {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 30px;
          list-style: none;
        }
        .pro-features li {
          background: rgba(255,255,255,0.1);
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
          color: #fff;
        }
        #apply {
          text-align: center;
          padding: 100px 0;
          background: #f8fafc;
        }
        .main-btn {
          background: #00AFFF;
          color: #fff;
          padding: 18px 40px;
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          display: inline-block;
          border-radius: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 175, 255, 0.3);
        }
        .main-btn:hover {
          transform: translateY(-2px);
          background: #008ecc;
          box-shadow: 0 8px 20px rgba(0, 175, 255, 0.4);
        }
        footer {
          background: #fff;
          padding: 40px 0;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 14px;
        }
        @media (max-width: 992px) {
          h1 { font-size: 40px; }
          h2 { font-size: 32px; }
          .curriculum-wrapper, .tech-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .curr-sidebar { position: static; margin-bottom: 20px; }
          .nav-links { display: none; }
          .pro-features { flex-direction: column; gap: 10px; }
          .track-row.cols-2, .track-row.cols-3 { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .use-case-grid { grid-template-columns: 1fr; }
        }
        .related-projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 40px;
        }
        @media (max-width: 1024px) {
          .related-projects-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }
        @media (max-width: 768px) {
          .related-projects-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
      <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      
      <Navbar />
      <div>
        {/* HERO SECTION */}
        <section id="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <div className="tag-badge">AI Native Web Development</div>
              <h1>디자인 툴 없이,<br />AI와 바이브 코딩으로<br /><span className="text-brand">4주 만에 완성합니다.</span></h1>
              <p className="main-desc">
                복잡한 이론은 뺐습니다. 실리콘밸리의 최신 AI 도구(MCP)로<br />
                기획부터 배포까지 가장 빠르게 배우는 실전형 강의입니다.
              </p>
              <a href="#curriculum" className="main-btn">커리큘럼 확인하기</a>
              <p className="hero-note">* 사전 지식 없어도 수강 가능합니다.</p>
            </div>
            <div className="hero-img-box">
              <img src="/images/homepage_make_1.png" alt="AI Native Web Development - 디자인 툴 없이, AI와 바이브 코딩으로 4주 만에 완성" onError={(e) => {
                const target = e.target as HTMLImageElement;
                // 확장자 자동 시도
                if (target.src.endsWith('.png')) {
                  target.src = '/images/homepage_make_1.jpg';
                } else if (target.src.endsWith('.jpg')) {
                  target.src = '/images/homepage_make_1.webp';
                } else {
                  target.src = '/images/homepage_make_1.png';
                }
              }} />
            </div>
          </div>
        </section>

        {/* NECESSITY & USE CASES SECTION */}
        <section id="necessity" className="section">
          <div className="container">
            <div className="necessity-header">
              <div className="tag-badge" style={{ background: '#f3e8ff', color: '#7B61FF' }}>Learning Philosophy</div>
              <h2>Zero to 100이 아닌, <span className="text-brand">100 to Zero.</span></h2>
              <p>기초부터 쌓아 올려 언제 완성하나요?<br />AI로 완벽한 결과물(100)을 먼저 만들고, 그 원리(0)를 역으로 파헤치며 배우세요.</p>
            </div>
            
            <div className="use-case-grid">
              <div className="use-case-card">
                <div className="use-case-img bg-uc-1">
                  <i className="fa-solid fa-flag-checkered"></i>
                </div>
                <div className="use-case-content">
                  <h4>1. 결과물 먼저 (100)</h4>
                  <p>빈 화면에 'Hello World'를 치며 지루해하지 마세요. AI를 통해 <strong>상용 수준의 웹사이트를 즉시 생성</strong>하고, 100점짜리 결과물을 눈앞에 둔 채 시작합니다.</p>
                </div>
              </div>
              <div className="use-case-card">
                <div className="use-case-img bg-uc-2">
                  <i className="fa-solid fa-magnifying-glass-chart"></i>
                </div>
                <div className="use-case-content">
                  <h4>2. 역공학 분석 (Reverse)</h4>
                  <p>"변수란 무엇인가"를 외우지 않습니다. <strong>"이 결제 버튼은 왜 작동하지?"</strong>를 궁금해하며, 잘 짜여진 코드를 거꾸로 뜯어보고 원리를 습득합니다.</p>
                </div>
              </div>
              <div className="use-case-card">
                <div className="use-case-img bg-uc-3">
                  <i className="fa-solid fa-screwdriver-wrench"></i>
                </div>
                <div className="use-case-content">
                  <h4>3. 핵심만 학습 (Zero)</h4>
                  <p>모든 문법을 공부할 필요 없습니다. 내 서비스를 <strong>내 의도대로 수정하고 커스터마이징</strong>하는 데 필요한 핵심 지식만 골라 효율적으로 배웁니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="section bg-light">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <h2>기존 코딩 학원과 무엇이 다른가요?</h2>
              <p>불필요한 과정은 과감히 생략했습니다.<br />오직 '작동하는 결과물'을 만드는 4가지 핵심 기술에 집중합니다.</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="icon-circle"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                <h3>PRD & Generative UI</h3>
                <p>디자인 툴 조작보다 <strong>기획(PRD)</strong>이 핵심입니다. AI와 함께 작성한 탄탄한 설계도를 <strong>Lovable</strong>에 입력하여 전문가 수준의 디자인을 즉시 완성합니다.</p>
              </div>
              <div className="feature-card">
                <div className="icon-circle"><i className="fa-solid fa-laptop-code"></i></div>
                <h3>AI 에이전트 코딩</h3>
                <p>단순 자동 완성이 아닙니다. <strong>Cursor</strong>에게 프로젝트 문맥(Context)을 학습시켜, 프론트엔드 비즈니스 로직을 시니어 개발자 수준으로 구현합니다.</p>
              </div>
              <div className="feature-card">
                <div className="icon-circle"><i className="fa-solid fa-database"></i></div>
                <h3>Serverless DB 구축</h3>
                <p>백엔드 개발자 없이도 데이터를 관리합니다. <strong>Supabase</strong>를 연동하여 회원가입, 데이터 저장/조회 같은 서버 기능을 직접 구축합니다.</p>
              </div>
              <div className="feature-card">
                <div className="icon-circle"><i className="fa-solid fa-credit-card"></i></div>
                <h3>실전 수익화 경험</h3>
                <p>장난감 프로젝트에서 끝나지 않습니다. <strong>실제 카드 결제(PG)</strong>를 연동하여 매출이 발생하는 진짜 상용 서비스를 만듭니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CURRICULUM SECTION */}
        <section id="curriculum" className="section">
          <div className="container">
            <div className="curriculum-wrapper">
              <div className="curr-sidebar">
                <div className="tag-badge">Curriculum</div>
                <h2>체계적인<br />풀스택 로드맵</h2>
                <p>프론트엔드(화면)부터 백엔드(데이터)까지.<br />AI와 함께 빈틈없이 완성합니다.</p>
              </div>
              
              <div className="curr-content">
                <div className="track-divider"><span>PART 1 : AI FRONTEND</span></div>
                <div className="track-row cols-2">
                  <div className="week-item">
                    <div className="type-badge type-fe">Frontend Focus</div>
                    <div className="week-badge">WEEK 01</div>
                    <h3>기획 & 생성형 UI 디자인</h3>
                    <p style={{ fontSize: '15px' }}>Gemini로 기획서(PRD)를 작성하고, Lovable로 전문가급 UI 코드를 생성합니다.</p>
                    <div className="tech-stack-box">
                      <span className="tech-badge">PRD 기획</span>
                      <span className="tech-badge">Lovable</span>
                      <span className="tech-badge">React/Next.js</span>
                    </div>
                  </div>
                  <div className="week-item">
                    <div className="type-badge type-fe">Frontend Logic</div>
                    <div className="week-badge">WEEK 02-1</div>
                    <h3>AI 엔지니어링 & 상태 관리</h3>
                    <p style={{ fontSize: '15px' }}>Cursor 개발 환경을 세팅하고, 장바구니/계산기 등 핵심 비즈니스 로직을 구현합니다.</p>
                    <div className="tech-stack-box">
                      <span className="tech-badge">Cursor MCP</span>
                      <span className="tech-badge">TypeScript</span>
                      <span className="tech-badge">State Management</span>
                    </div>
                  </div>
                </div>
                <div className="track-divider"><span>PART 2 : AI BACKEND & DEVOPS</span></div>
                <div className="track-row cols-2">
                  <div className="week-item">
                    <div className="type-badge type-be">Backend Focus</div>
                    <div className="week-badge">WEEK 03</div>
                    <h3 style={{ fontSize: '18px' }}>DB 연동 및 최적화</h3>
                    <p style={{ fontSize: '14px' }}>백엔드 없이 <strong>Supabase</strong> DB를 구축하고, API 연동과 사용자 경험(UX) 최적화까지 완성합니다.</p>
                    <div className="tech-stack-box">
                      <span className="tech-badge">Supabase</span>
                      <span className="tech-badge">SQL</span>
                      <span className="tech-badge">API</span>
                      <span className="tech-badge">UX</span>
                    </div>
                  </div>
                  <div className="week-item" style={{ border: '1px solid #7B61FF', background: '#fbfbfc' }}>
                    <div className="type-badge type-be" style={{ background: '#7B61FF', color: '#fff' }}>Advanced</div>
                    <div className="week-badge pro" style={{ color: '#7B61FF', background: '#f3e8ff' }}>WEEK 04</div>
                    <h3 style={{ fontSize: '18px', color: '#7B61FF' }}>결제 시스템 구축 및 배포</h3>
                    <p style={{ fontSize: '14px' }}>토스 페이먼츠 결제 서버 연동, 보안(Security) 설정 후 Vercel을 통해 서비스를 배포합니다.</p>
                    <div className="tech-stack-box">
                      <span className="tech-badge">Payments</span>
                      <span className="tech-badge">Security</span>
                      <span className="tech-badge">Vercel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECH DETAIL SECTION */}
        <section id="tech" className="section bg-light">
          <div className="container tech-container">
            <div>
              <div className="tag-badge">Core Technology</div>
              <h2>MCP 기반의<br />최신 AI 엔지니어링</h2>
              <p style={{ marginTop: '20px' }}>
                단순히 "코드를 짜줘"라고 말하는 시대는 지났습니다.<br />
                AI에게 <strong>문맥(Context)</strong>과 <strong>공식 문서(Docs)</strong>를 제공하여
                프론트엔드부터 DB까지 완벽하게 구축하는 법을 배웁니다.
              </p>
              <ul className="check-list">
                <li><i className="fa-solid fa-check-circle"></i> <strong>Context Injection:</strong> 기획 의도와 DB 스키마를 AI에게 주입</li>
                <li><i className="fa-solid fa-check-circle"></i> <strong>Fullstack AI:</strong> Cursor로 프론트엔드와 Supabase(DB) 통합 개발</li>
                <li><i className="fa-solid fa-check-circle"></i> <strong>System Prompt:</strong> .cursorrules로 나만의 AI 사수 만들기</li>
              </ul>
            </div>
            <div>
              <div className="code-window">
                <span style={{ color: '#64748b' }}>// .cursorrules + Supabase 예시</span><br />
                role: "Fullstack Engineer"<br />
                tech_stack: ["Next.js", "Supabase", "Tailwind"]<br />
                rule: "Use Supabase client for DB operations"<br />
                <span style={{ color: '#4ade80' }}>{" > User: \"Create a 'products' table and fetch data\""}</span><br />
                <span style={{ color: '#38bdf8' }}>{" > AI: Creating SQL migration... [OK]"}</span><br />
                <span style={{ color: '#38bdf8' }}>{" > AI: Connecting to Supabase... [OK]"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED PROJECTS SECTION */}
        <section className="section bg-light">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                <div className="tag-badge" style={{ background: '#f3e8ff', color: '#7B61FF' }}>{sectionTexts.badge}</div>
                <h2 style={{ marginTop: '12px' }}>{sectionTexts.title}</h2>
                <p style={{ marginTop: '10px', fontSize: '18px', color: '#64748b' }}>
                  {sectionTexts.description}
                </p>
              </div>
              {isAdmin && !isCheckingAdmin && (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {!isEditingProjects ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingProjects(true)}
                    >
                      프로젝트 수정
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsEditingProjects(false);
                          setShowProjectSelector(false);
                        }}
                      >
                        완료
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditingTexts && (
              <div className="card" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label className="text-sm font-medium mb-1 block">태그 배지 텍스트</label>
                    <input
                      type="text"
                      value={sectionTexts.badge}
                      onChange={(e) => setSectionTexts({ ...sectionTexts, badge: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="예: Student Projects"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">섹션 제목</label>
                    <input
                      type="text"
                      value={sectionTexts.title}
                      onChange={(e) => setSectionTexts({ ...sectionTexts, title: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="예: 관련 학생 프로젝트"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">섹션 설명</label>
                    <textarea
                      value={sectionTexts.description}
                      onChange={(e) => setSectionTexts({ ...sectionTexts, description: e.target.value })}
                      className="w-full p-2 border rounded-md min-h-[80px]"
                      placeholder="예: 이 커리큘럼을 수강한 학생들의 프로젝트를 확인해보세요"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {isEditingProjects && isAdmin && (
              <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>프로젝트 관리</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      onClick={() => setShowProjectSelector(!showProjectSelector)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      프로젝트 목록에서 추가
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowProjectInput(!showProjectInput)}
                    >
                      링크로 불러오기
                    </Button>
                  </div>
                </div>

                {showProjectInput && (
                  <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={projectInput}
                      onChange={(e) => setProjectInput(e.target.value)}
                      placeholder="프로젝트 URL 또는 ID"
                      className="w-full md:w-auto flex-1 p-2 border rounded-md"
                    />
                    <Button size="sm" onClick={addProjectByInput}>추가</Button>
                  </div>
                )}

                {showProjectSelector && (
                  <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', maxHeight: '300px', overflowY: 'auto' }}>
                    {isLoadingAllProjects ? (
                      <p style={{ textAlign: 'center', color: '#64748b' }}>로딩 중...</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {allProjects
                          .filter((p) => !relatedProjects.some((rp) => rp.id === p.id))
                          .map((project) => (
                            <div
                              key={project.id}
                              onClick={() => addProjectToCurriculum(project.id)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                            >
                              <div>
                                <p style={{ fontWeight: 500, fontSize: '14px' }}>{project.title}</p>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>
                                  {project.profiles?.name || '익명'}
                                </p>
                              </div>
                              <Plus className="h-4 w-4" style={{ color: '#64748b' }} />
                            </div>
                          ))}
                        {allProjects.filter((p) => !relatedProjects.some((rp) => rp.id === p.id)).length === 0 && (
                          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            추가할 수 있는 프로젝트가 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isLoadingProjects ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#64748b' }}>프로젝트를 불러오는 중...</p>
              </div>
            ) : relatedProjects.length > 0 ? (
              <>
                <div className="related-projects-grid">
                  {relatedProjects.map((project, index) => (
                    <div
                      key={project.id}
                      style={{ position: 'relative' }}
                    >
                      {isEditingProjects && isAdmin && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 10,
                          display: 'flex',
                          gap: '4px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          padding: '4px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {index > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProjectOrder(project.id, index - 1);
                              }}
                              style={{
                                padding: '4px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <ArrowUp className="h-4 w-4" style={{ color: '#64748b' }} />
                            </button>
                          )}
                          {index < relatedProjects.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProjectOrder(project.id, index + 1);
                              }}
                              style={{
                                padding: '4px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <ArrowDown className="h-4 w-4" style={{ color: '#64748b' }} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("이 프로젝트를 제거하시겠습니까?")) {
                                removeProjectFromCurriculum(project.id);
                              }
                            }}
                            style={{
                              padding: '4px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <X className="h-4 w-4" style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      )}
                      <div
                        onClick={() => !isEditingProjects && navigate(`/portfolio/${project.id}`)}
                        style={{ cursor: isEditingProjects ? 'default' : 'pointer' }}
                      >
                        <PortfolioCard
                          id={project.id}
                          title={project.title || '제목 없음'}
                          student={project.profiles?.name || '익명'}
                          description={project.description || ''}
                          category={project.category || 'AI 활용'}
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
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/portfolio?category=전체&tag=홈페이지">
                    <Button 
                      size="lg" 
                      className="main-btn"
                      style={{ 
                        background: '#00AFFF',
                        color: '#fff',
                        padding: '18px 40px',
                        fontSize: '18px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0, 175, 255, 0.3)'
                      }}
                    >
                      모든 프로젝트 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>아직 등록된 프로젝트가 없습니다.</p>
                <Link to="/portfolio?category=AI 활용">
                  <Button 
                    size="lg" 
                    className="main-btn"
                    style={{ 
                      background: '#00AFFF',
                      color: '#fff',
                      padding: '18px 40px',
                      fontSize: '18px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(0, 175, 255, 0.3)'
                    }}
                  >
                    포트폴리오 페이지로 이동
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default AINativeWebMasterClass3;

