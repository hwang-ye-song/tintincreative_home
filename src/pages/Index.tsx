import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CurriculumCard } from "@/components/CurriculumCard";
import { PortfolioCard } from "@/components/PortfolioCard";
import { FacultyCard } from "@/components/FacultyCard";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentButton } from "@/components/PaymentButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Brain, Lightbulb, ArrowRight, Rocket, Code, Smartphone, Cpu, MessageSquare, Box, ChevronDown, Pencil, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { smoothScrollTo, devLog } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { getOptimizedThumbnailUrl } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const { isAdminOrTeacher } = useAuth();
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  const [isPopupEditMode, setIsPopupEditMode] = useState(false);
  const [editPopupData, setEditPopupData] = useState<any>(null);
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const [isResizingPopup, setIsResizingPopup] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {

        // 홈페이지에 표시할 프로젝트만 가져오기 (관리자가 설정한 best of best)
        const { data: projects, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles (name, avatar_url)
          `)
          .eq("is_hidden", false)
          .eq("is_featured_home", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        // 댓글/좋아요 수 가져오기
        if (projects && projects.length > 0) {
          const projectIds = projects.map((p) => p.id);
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

          const commentCounts: Record<string, number> = {};
          const likeCounts: Record<string, number> = {};

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

          const projectsWithCounts = projects.map((project) => ({
            ...project,
            commentCount: commentCounts[project.id] || 0,
            likeCount: likeCounts[project.id] || 0,
            view_count: project.view_count || 0,
          })) as Project[];

          setFeaturedProjects(projectsWithCounts);
        }
      } catch (error) {
        devLog.error("Error loading featured projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadData();
  }, []);

  // 팝업 설정 가져오기
  const { data: popupSettings } = useQuery({
    queryKey: ["popupSettings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("popup_settings")
          .select("*")
          .eq("id", "main")
          .maybeSingle(); // .single() 대신 .maybeSingle() 사용 (데이터가 없으면 null 반환)

        if (error) {
          // 테이블이 없거나 접근 권한이 없는 경우
          if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("406")) {
            devLog.warn("Popup settings table does not exist. Please run the migration:", error);
            return null;
          }
          devLog.error("Error fetching popup settings:", error);
          return null;
        }

        // 데이터가 없으면 null 반환 (에러가 아닌 정상 상태)
        return data;
      } catch (err) {
        devLog.error("Unexpected error fetching popup settings:", err);
        return null;
      }
    },
    staleTime: 60 * 1000, // 1분간 캐시
    retry: false, // 테이블이 없으면 재시도하지 않음
  });

  // 팝업 표시 여부 확인
  useEffect(() => {
    // 편집 모드일 때는 팝업을 항상 표시 (이미 위에서 처리됨)
    if (isPopupEditMode) {
      return;
    }

    if (popupSettings && popupSettings.is_enabled) {
      // 24시간 동안 안 보기 체크
      const popupHiddenUntil = localStorage.getItem("popup_hidden_until");
      if (popupHiddenUntil) {
        const hiddenUntilTime = parseInt(popupHiddenUntil, 10);
        const now = Date.now();
        if (now < hiddenUntilTime) {
          // 아직 24시간이 지나지 않았으면 표시하지 않음
          return;
        } else {
          // 24시간이 지났으면 localStorage에서 제거
          localStorage.removeItem("popup_hidden_until");
        }
      }

      // 세션당 한 번만 표시하는 경우
      if (popupSettings.show_once_per_session) {
        const popupShown = sessionStorage.getItem("popup_shown");
        if (!popupShown) {
          setPopupData(popupSettings);
          setShowPopup(true);
          sessionStorage.setItem("popup_shown", "true");
        }
      } else {
        // 매번 표시
        setPopupData(popupSettings);
        setShowPopup(true);
      }
    }
  }, [popupSettings]);

  // 24시간 동안 안 보기 처리
  const handleDontShowFor24Hours = () => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24시간을 밀리초로 변환
    const hiddenUntil = now + twentyFourHours;
    localStorage.setItem("popup_hidden_until", hiddenUntil.toString());
    setShowPopup(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get("section");
    const popupEdit = params.get("popupEdit");

    // 팝업 편집 모드 확인
    if (popupEdit === "true") {
      setIsPopupEditMode(true);
      // localStorage에서 편집 데이터 가져오기
      const editData = localStorage.getItem('popupEditData');
      if (editData) {
        try {
          const data = JSON.parse(editData);
          setEditPopupData(data);
          setShowPopup(true);

          // 이미지가 있으면 비율 계산
          if (data.image_url) {
            const img = new Image();
            img.onload = () => {
              setImageAspectRatio(img.naturalWidth / img.naturalHeight);
            };
            img.src = data.image_url;
          }
        } catch (e) {
          console.error('Failed to parse popup edit data', e);
        }
      }
    }

    if (target) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 스크롤
      setTimeout(() => {
        const element = document.getElementById(target);
        if (element) {
          // Navbar 높이를 고려한 offset 계산
          const navbar = document.querySelector('nav');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          // 커스텀 부드러운 스크롤 사용
          smoothScrollTo(offsetPosition, 800);
        }
      }, 100);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  const scrollToCurriculum = () => {
    const element = document.getElementById("curriculum");
    if (element) {
      // Navbar 높이를 고려하여 정확한 위치로 스크롤 (포트폴리오와 동일)
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      // 커스텀 부드러운 스크롤 사용
      smoothScrollTo(offsetPosition, 800);
    }
  };

  const categories = ["전체", "AI 기초", "AI 활용", "AI로봇"];

  const curriculumData = [
    {
      id: "basic-2",
      title: "AI 프로그래밍 입문",
      description: "Python과 머신러닝 라이브러리를 활용한 실습",
      level: "초급",
      duration: "6주",
      icon: <Code className="h-6 w-6" />,
      image: "/images/COSPRO.jpg",
      category: "AI 기초",
    },
    {
      id: "basic",
      title: "기초 트랙 (Perception AI)",
      description: "AI와 머신러닝의 기초를 배우세요",
      level: "초급",
      duration: "12주",
      icon: <Lightbulb className="h-6 w-6" />,
      image: "/images/aice.jpg",
      category: "AI 기초",
    },
    {
      id: "application-4",
      title: "AI 챗봇 및 대화형 시스템",
      description: "자연어 처리와 대화형 AI 시스템 구축",
      level: "중급",
      duration: "15주",
      icon: <MessageSquare className="h-6 w-6" />,
      image: "/images/chat_bot_ai.jpg",
      category: "AI 활용",
    },
    {
      id: "application-3",
      title: "나만의 WEB / Mobile APP디자인",
      description: "AI를 활용해서 나만의 쇼핑몰 제작",
      level: "중급",
      duration: "4주",
      icon: <Smartphone className="h-6 w-6" />,
      image: "/images/homepage_make_1.jpg",
      category: "AI 활용",
    },
    {
      id: "application-2",
      title: "컴퓨터 비전",
      description: "실전 프로젝트를 통한 고급 AI 기술 습득",
      level: "중급",
      duration: "14주",
      icon: <Code className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
      category: "AI 활용",
    },
    {
      id: "robot",
      title: "로봇공학 트랙 - 자율주행",
      description: "ROS1 Melodic 환경 구축부터 SLAM, Navigation, 그리고 실전 자율주행 프로젝트까지",
      level: "고급",
      duration: "5주",
      icon: <Bot className="h-6 w-6" />,
      image: "/images/omo_r1mini_card.png",
      category: "AI로봇",
    },
    {
      id: "robot-2",
      title: "로봇공학 트랙 - 6축 다관절 로봇팔",
      description: "로봇 하드웨어 제어와 다양한 센서 활용",
      level: "고급",
      duration: "18주",
      icon: <Cpu className="h-6 w-6" />,
      image: "/images/lerobot.gif",
      category: "AI로봇",
    },
  ];

  // 커리큘럼 설정 가져오기 (숨김 처리된 커리큘럼 필터링)
  const { data: curriculumSettings = {} } = useQuery<Record<string, { id: string; is_hidden: boolean }>>({
    queryKey: ["curriculumSettings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("curriculum_settings")
        .select("*");

      if (error) {
        devLog.error("Error fetching curriculum settings:", error);
        return {};
      }

      const settingsMap: Record<string, { id: string; is_hidden: boolean }> = {};
      if (data) {
        data.forEach((setting: any) => {
          settingsMap[setting.id] = setting;
        });
      }
      return settingsMap;
    },
    staleTime: 30 * 1000,
  });

  // 숨겨진 커리큘럼 필터링
  const visibleCurriculums = curriculumData.filter((curriculum) => {
    const setting = curriculumSettings[curriculum.id];
    return !setting?.is_hidden; // is_hidden이 true이면 필터링
  });

  const filteredCurriculums = selectedCategory === "전체"
    ? visibleCurriculums
    : visibleCurriculums.filter(curriculum => curriculum.category === selectedCategory);

  // 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 팝업 편집 모드: 드래그 및 리사이즈 핸들러
  useEffect(() => {
    if (!isPopupEditMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPopup && editPopupData) {
        e.preventDefault();
        const newLeftPercent = (e.clientX / window.innerWidth) * 100;
        const newTopPercent = (e.clientY / window.innerHeight) * 100;

        // 팝업 크기 고려한 제한
        const popupWidth = parseInt(editPopupData.max_width) || 250;
        const popupHeight = parseInt(editPopupData.max_height) || 300;
        const minLeftPercent = (popupWidth / 2 / window.innerWidth) * 100;
        const maxLeftPercent = 100 - (popupWidth / 2 / window.innerWidth) * 100;
        const minTopPercent = (popupHeight / 2 / window.innerHeight) * 100;
        const maxTopPercent = 100 - (popupHeight / 2 / window.innerHeight) * 100;

        const updatedData = {
          ...editPopupData,
          left_offset: `${Math.max(minLeftPercent, Math.min(maxLeftPercent, newLeftPercent))}%`,
          top_offset: `${Math.max(minTopPercent, Math.min(maxTopPercent, newTopPercent))}%`,
          position: "custom",
        };
        setEditPopupData(updatedData);
        localStorage.setItem('popupEditData', JSON.stringify(updatedData));
      } else if (isResizingPopup && editPopupData) {
        e.preventDefault();
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;

        if (editPopupData.image_url && imageAspectRatio) {
          newWidth = Math.max(100, Math.min(1200, resizeStart.width + deltaX));
          newHeight = newWidth / imageAspectRatio;
        } else {
          newWidth = Math.max(100, Math.min(1200, resizeStart.width + deltaX));
          newHeight = Math.max(100, Math.min(1200, resizeStart.height + deltaY));
        }

        const updatedData = {
          ...editPopupData,
          max_width: `${Math.round(newWidth)}px`,
          max_height: `${Math.round(newHeight)}px`,
          position: "custom",
        };
        setEditPopupData(updatedData);
        localStorage.setItem('popupEditData', JSON.stringify(updatedData));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPopup(false);
      setIsResizingPopup(false);
    };

    if (isDraggingPopup || isResizingPopup) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isPopupEditMode, isDraggingPopup, isResizingPopup, editPopupData, dragStart, resizeStart, imageAspectRatio]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>틴틴AI로봇아카데미 - AI & 로봇공학 아카데미</title>
        <meta name="description" content="AI와 로봇공학을 배우는 종합 교육 플랫폼. 기초부터 고급까지 체계적인 커리큘럼으로 전문가가 되세요." />
        <meta property="og:title" content="틴틴AI로봇아카데미 - AI & 로봇공학 아카데미" />
        <meta property="og:description" content="AI와 로봇공학을 배우는 종합 교육 플랫폼. 기초부터 고급까지 체계적인 커리큘럼으로 전문가가 되세요." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://tintinairobot.com/images/og_image_one.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="틴틴AI로봇아카데미" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="틴틴AI로봇아카데미 - AI & 로봇공학 아카데미" />
        <meta name="twitter:description" content="AI와 로봇공학을 배우는 종합 교육 플랫폼. 기초부터 고급까지 체계적인 커리큘럼으로 전문가가 되세요." />
        <meta name="twitter:image" content="https://tintinairobot.com/images/og_image_one.png" />
      </Helmet>
      <Navbar />

      {/* Hero Section with Canvas Animation */}
      <HeroCanvas />

      {/* Learning Roadmap */}
      <section id="roadmap" className="relative py-8 px-4 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#f0f7ff' }}>
        {/* Background: Large glowing blobs */}
        <div className="absolute top-[-30%] left-[-20%] w-[80vw] h-[80vw] bg-blue-300/30 rounded-full filter blur-[150px] animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[80vw] h-[80vw] bg-purple-300/30 rounded-full filter blur-[150px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-200/20 rounded-full filter blur-[120px] animate-pulse mix-blend-screen" style={{ animationDelay: '4s' }}></div>

        <div className="container mx-auto max-w-7xl relative z-20">
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 z-20 text-center relative leading-tight" style={{ color: '#1e293b' }}>
            AI교육 커리큘럼
          </h1>

          {/* Curriculum Stages Container */}
          <div className="w-full max-w-7xl flex flex-col md:flex-row items-stretch justify-center gap-4 relative z-20 mb-6 px-4 md:px-0">
            {/* STAGE 1 Card */}
            <div className="flex-1 min-w-0 relative p-3 md:p-4 lg:p-5 flex flex-col items-center text-center group animate-fade-in"
              style={{
                flexBasis: 0,
                background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.8), rgba(240, 245, 255, 0.5))',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '2px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px -15px rgba(60, 100, 255, 0.2)',
                transition: 'all 0.3s ease',
              }}>
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  opacity: 0.6,
                }}></div>

              <div className="relative z-10 w-full">
                <div className="mb-2 md:mb-3">
                  <span className="font-extrabold text-sm md:text-base lg:text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 1</span>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-1 md:mb-2" style={{ color: '#3b267d' }}>AI BASIC</h2>
                <p className="text-muted-foreground font-semibold mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm lg:text-lg">(기초 다지기)</p>

                {/* Stage 1 Visuals */}
                <div className="flex justify-center items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 mb-3 md:mb-4 lg:mb-5 h-16 md:h-20 lg:h-24">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl border-2 flex items-center justify-center"
                    style={{
                      background: 'rgba(219, 234, 254, 0.5)',
                      borderColor: 'rgba(147, 197, 253, 0.5)',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
                    }}>
                    <Code className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-12 lg:w-12 text-primary" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 flex items-center justify-center animate-pulse"
                    style={{
                      background: 'rgba(243, 232, 255, 0.5)',
                      borderColor: 'rgba(196, 181, 253, 0.5)',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                    }}>
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-12 lg:w-12 text-accent" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  </div>
                </div>

                <p className="text-foreground/70 font-medium leading-relaxed mt-auto text-xs md:text-sm lg:text-base">
                  CosPro3급(파이썬 기초)
                  <br />AICE(인공지능 기초)<br />
                  자격증 취득
                </p>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="flex items-center justify-center z-10 md:-mx-3">
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 hidden md:block"
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                }} />
              <ChevronDown className="h-6 w-6 block md:hidden py-4"
                style={{
                  background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                }} />
            </div>

            {/* STAGE 2 Card */}
            <div className="flex-1 min-w-0 relative p-3 md:p-4 lg:p-5 flex flex-col items-center text-center animate-fade-in"
              style={{
                animationDelay: '0.1s',
                flexBasis: 0,
                background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.8), rgba(240, 245, 255, 0.5))',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '2px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px -15px rgba(60, 100, 255, 0.2)',
                transition: 'all 0.3s ease',
              }}>
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  opacity: 0.6,
                }}></div>

              <div className="relative z-10 w-full">
                <div className="mb-2 md:mb-3">
                  <span className="font-extrabold text-sm md:text-base lg:text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 2</span>
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold mb-1 md:mb-2 break-keep leading-tight" style={{ color: '#3b267d' }}>SERVICE & AGENT AI</h2>
                <p className="text-muted-foreground font-semibold mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm lg:text-lg">(소프트웨어 AI 통합)</p>

                {/* Stage 2 Visuals */}
                <div className="flex justify-center items-center relative mb-3 md:mb-4 lg:mb-5 h-16 md:h-20 lg:h-24 w-full overflow-hidden">
                  {/* Phone Frame */}
                  <div className="w-12 h-20 sm:w-14 sm:h-22 md:w-16 md:h-24 lg:w-20 lg:h-32 rounded-[1.5rem] md:rounded-[1.75rem] lg:rounded-[2rem] flex flex-col items-center justify-start absolute left-1/2 transform -translate-x-[2.5rem] sm:-translate-x-[3rem] md:-translate-x-[3.5rem] lg:-translate-x-14 z-10 shadow-lg"
                    style={{
                      border: '2px solid rgba(96, 165, 250, 0.8)',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }}>
                    <div className="w-5 h-0.5 sm:w-6 sm:h-1 md:w-8 md:h-1.5 lg:w-10 lg:h-1.5 rounded-full mt-1.5 sm:mt-2 md:mt-2.5 lg:mt-3" style={{ background: 'rgba(191, 219, 254, 1)' }}></div>
                    <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: 'rgba(219, 234, 254, 1)' }}>
                      <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-primary" />
                    </div>
                  </div>

                  {/* Logic Flow */}
                  <div className="absolute left-1/2 transform translate-x-1.5 sm:translate-x-2 md:translate-x-3 lg:translate-x-4 flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 z-0">
                    <div className="w-8 h-7 sm:w-9 sm:h-8 md:w-12 md:h-10 lg:w-14 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm"
                      style={{
                        border: '2px solid rgba(196, 181, 253, 0.6)',
                        background: 'rgba(255, 255, 255, 0.8)',
                      }}>
                      <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-accent" />
                    </div>
                    <div className="w-0.5 h-3 sm:h-4 md:h-5 lg:h-6 mx-auto" style={{ background: 'rgba(196, 181, 253, 0.5)' }}></div>
                    <div className="w-8 h-7 sm:w-9 sm:h-8 md:w-12 md:h-10 lg:w-14 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm"
                      style={{
                        border: '2px solid rgba(196, 181, 253, 0.6)',
                        background: 'rgba(255, 255, 255, 0.8)',
                      }}>
                      <Box className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-accent" />
                    </div>
                  </div>

                  {/* Connecting Lines */}
                  <svg className="absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 left-1/2 -translate-x-5 sm:-translate-x-6 md:-translate-x-7 lg:-translate-x-8" style={{ zIndex: -1, filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))' }}>
                    <path d="M25 50 C 40 30, 60 30, 75 35" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.6} />
                    <path d="M25 50 C 40 70, 60 70, 75 65" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.6} />
                  </svg>
                </div>

                <p className="text-foreground/70 font-medium leading-relaxed mt-auto pt-2 md:pt-3 lg:pt-4 text-xs md:text-sm lg:text-base">
                  Chat bot 제작<br />
                  WEB & Mobile APP디자인<br />
                  Vision AI 학습
                </p>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="flex items-center justify-center z-10 md:-mx-3">
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 hidden md:block"
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                }} />
              <ChevronDown className="h-6 w-6 block md:hidden py-4"
                style={{
                  background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                }} />
            </div>

            {/* STAGE 3 Card */}
            <div className="flex-1 min-w-0 relative p-3 md:p-4 lg:p-5 flex flex-col items-center text-center animate-fade-in"
              style={{
                animationDelay: '0.2s',
                flexBasis: 0,
                background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.8), rgba(240, 245, 255, 0.5))',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '2px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px -15px rgba(60, 100, 255, 0.2)',
                transition: 'all 0.3s ease',
              }}>
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  opacity: 0.6,
                }}></div>

              <div className="relative z-10 w-full">
                <div className="mb-2 md:mb-3">
                  <span className="font-extrabold text-sm md:text-base lg:text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 3</span>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-1 md:mb-2" style={{ color: '#3b267d' }}>PHYSICAL AI</h2>
                <p className="text-muted-foreground font-semibold mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm lg:text-lg">(실전 하드웨어 적용)</p>

                {/* Stage 3 Visuals */}
                <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-5 w-full px-2 md:px-3 lg:px-4 h-16 md:h-20 lg:h-24 items-end">
                  {/* R1 Mini Box */}
                  <div className="flex flex-col items-center transform rotate-[-5deg]">
                    <div className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-16 lg:w-24 lg:h-20 rounded-lg sm:rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden border-b-[3px] sm:border-b-[4px] md:border-b-[5px] lg:border-b-[6px]"
                      style={{
                        background: 'linear-gradient(to bottom right, #374151, #111827)',
                        borderBottomColor: '#030712',
                      }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
                      <span className="text-gray-200 font-bold text-[10px] sm:text-xs md:text-sm lg:text-lg tracking-wider font-mono relative z-10">R1</span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold mt-1.5 sm:mt-2 md:mt-3" style={{ color: '#374151' }}>R1 mini</span>
                  </div>

                  {/* LeRobot */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 relative flex items-center justify-center">
                      <Bot className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16" style={{
                        background: 'linear-gradient(to bottom, #9ca3af, #4b5563)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                      }} />
                      <div className="absolute bottom-1 sm:bottom-1 md:bottom-1.5 lg:bottom-2 w-8 h-1.5 sm:w-10 sm:h-2 md:w-12 md:h-3 lg:w-16 lg:h-4 rounded-full blur-md" style={{ background: 'rgba(59, 130, 246, 0.3)' }}></div>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold mt-1.5 sm:mt-2 md:mt-3" style={{ color: '#374151' }}>LeRobot</span>
                  </div>
                </div>

                <p className="text-foreground/70 font-medium leading-relaxed mt-auto text-xs md:text-sm lg:text-base">
                  자율주행 로봇 실습<br />
                  6축 다관절 로봇팔 실습
                </p>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <footer className="text-center text-muted-foreground font-medium text-base max-w-3xl mx-auto leading-relaxed z-20 px-4 mb-4">
            애플리케이션 개발자를 꿈꾸는 분들을 위한 고품격 AI 교육 커리큘럼을 함께하며,<br className="hidden md:block" />
            문제 정의와 해결을 통해 목표 달성과 성장에 중점을 둡니다.
          </footer>

          {/* 자세히 보기 버튼 */}
          <div className="text-center mt-4 z-20">
            <Button
              onClick={scrollToCurriculum}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              자세히 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="pt-12 pb-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-4 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-2">커리큘럼 상세</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              각 단계별 상세 커리큘럼을 확인하고 학습을 시작하세요
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`transition-all duration-300 ${selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                    : "hover:scale-105"
                    }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* AI 활용 하위 카테고리 탭 (2번 방안 구현) */}
            {selectedCategory === "AI 활용" && (
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

          {/* Curriculum Carousel */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex gap-3 sm:gap-4 md:gap-5 min-w-full snap-x snap-mandatory">
              {filteredCurriculums.map((curriculum, index) => (
                <div
                  key={`${selectedCategory}-${curriculum.id}`}
                  className="w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] snap-start flex-shrink-0"
                  style={{
                    animation: 'fadeInScale 0.5s ease-out forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    transform: 'translateY(20px) scale(0.95)',
                  }}
                >
                  <CurriculumCard
                    id={curriculum.id}
                    title={curriculum.title}
                    description={curriculum.description}
                    level={curriculum.level}
                    duration={curriculum.duration}
                    icon={curriculum.icon}
                    image={curriculum.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio" className="pt-12 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-3">
              <h2 className="font-heading text-4xl font-bold">학생 프로젝트</h2>
              {isAdminOrTeacher && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin?tab=featured")}
                  className="mt-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  수정하기
                </Button>
              )}
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              우리 학생들의 놀라운 작품들을 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {isLoadingProjects ? (
              // 로딩 중일 때 플레이스홀더 표시
              <>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                  </div>
                ))}
              </>
            ) : featuredProjects.length > 0 ? (
              // 실제 프로젝트 데이터 표시
              featuredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in hover-scale relative group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    onClick={() => navigate(`/portfolio/${project.id}`)}
                    className="cursor-pointer"
                  >
                    <PortfolioCard
                      id={project.id}
                      title={project.title || "제목 없음"}
                      student={(project.profiles as any)?.name || "익명"}
                      description={project.description || ""}
                      category={project.category || "기타"}
                      tags={project.tags || []}
                      commentCount={project.commentCount || 0}
                      likeCount={project.likeCount || 0}
                      viewCount={project.view_count || 0}
                      avatarUrl={(project.profiles as any)?.avatar_url || null}
                      imageUrl={project.image_url ? getOptimizedThumbnailUrl(project.image_url) : null}
                      videoUrl={project.video_url || null}
                      isBest={project.is_best || false}
                    />
                  </div>
                  {isAdminOrTeacher && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/90 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/portfolio/edit/${project.id}`);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      수정
                    </Button>
                  )}
                </div>
              ))
            ) : (
              // 프로젝트가 없을 때 기본 예제 표시
              <>
                <div className="animate-fade-in hover-scale">
                  <PortfolioCard
                    id="example-1"
                    title="스마트 홈 도우미"
                    student="김민준"
                    description="음성으로 제어되는 홈 자동화 시스템"
                    category="AI"
                    tags={[]}
                    commentCount={0}
                    likeCount={0}
                    viewCount={0}
                  />
                </div>
                <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
                  <PortfolioCard
                    id="example-2"
                    title="자율 주행 자동차"
                    student="이서연"
                    description="컴퓨터 비전을 활용한 미니 자율주행차"
                    category="로봇"
                    tags={[]}
                    commentCount={0}
                    likeCount={0}
                    viewCount={0}
                  />
                </div>
                <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
                  <PortfolioCard
                    id="example-3"
                    title="감정 분석 챗봇"
                    student="박지우"
                    description="사용자 감정을 이해하는 AI 챗봇"
                    category="NLP"
                    tags={[]}
                    commentCount={0}
                    likeCount={0}
                    viewCount={0}
                  />
                </div>
              </>
            )}
          </div>

          <div className="text-center animate-fade-in mt-4">
            <Link to="/portfolio" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="lg" className="hover-scale">
                모든 프로젝트 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Faculty Preview */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-4">강사진 소개</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="animate-fade-in hover-scale">
              <FacultyCard
                name="강경호"
                title="AI 프로그램 책임자"
                expertise={["머신러닝", "딥러닝", "컴퓨터 비전"]}
                bio="전 삼성전자 책임연구원"
                email=""
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
              <FacultyCard
                name="강다정"
                title="배터리 강사"
                expertise={["배터리", "에너지 저장", "전기화학"]}
                bio="과학고 졸업, UNIST"
                email=""
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <FacultyCard
                name="신옥철"
                title="AI 융합 논술 교수"
                expertise={["AI 융합 논술", "AI로 책 만들기"]}
                bio="(전) 경기대 교수"
                email=""
              />
            </div>
          </div>

          <div className="text-center animate-fade-in">
            <Link to="/faculty" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="lg" className="hover-scale">
                전체 강사진 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-lg p-12 text-center animate-fade-in hover-scale">
            <h2 className="font-heading text-4xl font-bold mb-4">학습 여정을 시작할 준비가 되셨나요?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              AI와 로봇공학을 배우는 수백 명의 학생들과 함께하세요. 얼리버드 할인 제공!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input type="email" placeholder="이메일을 입력하세요" className="flex-1" />
              <PaymentButton
                amount={99000}
                orderName="틴틴AI로봇아카데미 수강 신청"
                curriculumId="application-2"
                size="lg"
                className="hover-scale"
              >
                시작하기
              </PaymentButton>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              신용카드 불필요. 14일 무료 체험.
            </p>
          </div>
        </div>
      </section>

      {/* Popup Advertisement */}
      <Dialog open={showPopup} onOpenChange={(open) => {
        if (!isPopupEditMode) {
          setShowPopup(open);
        }
      }}>
        <DialogContent
          className={`p-0 ${isPopupEditMode ? "cursor-move" : "cursor-pointer"}`}
          style={{
            // 편집 모드일 때는 editPopupData 사용, 아니면 popupData 사용
            width: (isPopupEditMode ? editPopupData : popupData)?.image_url
              ? ((isPopupEditMode ? editPopupData : popupData)?.max_width || "auto")
              : ((isPopupEditMode ? editPopupData : popupData)?.max_width || "auto"),
            height: (isPopupEditMode ? editPopupData : popupData)?.image_url
              ? ((isPopupEditMode ? editPopupData : popupData)?.max_height === "auto" ? "auto" : (isPopupEditMode ? editPopupData : popupData)?.max_height || "auto")
              : ((isPopupEditMode ? editPopupData : popupData)?.max_height === "auto" ? "auto" : (isPopupEditMode ? editPopupData : popupData)?.max_height || "auto"),
            // 팝업이 화면 밖으로 나가지 않도록 제한
            maxWidth: `min(${(isPopupEditMode ? editPopupData : popupData)?.max_width || "500px"}, calc(100vw - 2rem))`,
            maxHeight: (isPopupEditMode ? editPopupData : popupData)?.image_url
              ? ((isPopupEditMode ? editPopupData : popupData)?.max_height === "auto" ? "auto" : `min(${(isPopupEditMode ? editPopupData : popupData)?.max_height || "auto"}, calc(100vh - 2rem))`)
              : `min(${(isPopupEditMode ? editPopupData : popupData)?.max_height === "auto" ? "90vh" : (isPopupEditMode ? editPopupData : popupData)?.max_height || "90vh"}, calc(100vh - 2rem))`,
            top: (isPopupEditMode ? editPopupData : popupData)?.top_offset || ((isPopupEditMode ? editPopupData : popupData)?.position === "center" ? "50%" : (isPopupEditMode ? editPopupData : popupData)?.position?.includes("top") ? "10%" : (isPopupEditMode ? editPopupData : popupData)?.position?.includes("bottom") ? "90%" : "50%"),
            left: (isPopupEditMode ? editPopupData : popupData)?.left_offset || ((isPopupEditMode ? editPopupData : popupData)?.position === "center" || (isPopupEditMode ? editPopupData : popupData)?.position?.includes("center") ? "50%" : (isPopupEditMode ? editPopupData : popupData)?.position?.includes("left") ? "10%" : (isPopupEditMode ? editPopupData : popupData)?.position?.includes("right") ? "90%" : "50%"),
            right: (isPopupEditMode ? editPopupData : popupData)?.position?.includes("right") && !(isPopupEditMode ? editPopupData : popupData)?.top_offset && !(isPopupEditMode ? editPopupData : popupData)?.left_offset ? "10%" : "auto",
            bottom: (isPopupEditMode ? editPopupData : popupData)?.position?.includes("bottom") && !(isPopupEditMode ? editPopupData : popupData)?.top_offset && !(isPopupEditMode ? editPopupData : popupData)?.left_offset ? "10%" : "auto",
            transform: ((isPopupEditMode ? editPopupData : popupData)?.top_offset || (isPopupEditMode ? editPopupData : popupData)?.left_offset) ? "translate(-50%, -50%)" :
              ((isPopupEditMode ? editPopupData : popupData)?.position === "center" ? "translate(-50%, -50%)" :
                (isPopupEditMode ? editPopupData : popupData)?.position?.includes("center") ? "translate(-50%, 0)" : "translate(0, 0)"),
            zIndex: (isPopupEditMode ? editPopupData : popupData)?.priority ?? 1000,
            overflow: (isPopupEditMode ? editPopupData : popupData)?.image_url ? "visible" : "auto", // 이미지가 있으면 스크롤 없음
            position: "fixed",
          }}
          onMouseDown={(e) => {
            if (isPopupEditMode) {
              // 리사이즈 핸들 클릭이면 드래그 안 함
              if ((e.target as HTMLElement).classList.contains("resize-handle") ||
                (e.target as HTMLElement).closest(".resize-handle")) return;
              e.preventDefault();
              setIsDraggingPopup(true);
              const popupElement = e.currentTarget as HTMLElement;
              const popupRect = popupElement.getBoundingClientRect();
              setDragStart({
                x: e.clientX - (popupRect.left + popupRect.width / 2),
                y: e.clientY - (popupRect.top + popupRect.height / 2),
              });
            }
          }}
          onClick={(e) => {
            if (isPopupEditMode) return; // 편집 모드에서는 클릭 이벤트 무시
            // 닫기 버튼이나 24시간 안 보기 버튼 클릭 시에는 링크 이동 안 함
            if ((e.target as HTMLElement).closest('button')) {
              return;
            }
            // 팝업 전체 클릭 시 링크로 이동
            const currentPopupData = popupData || editPopupData;
            if (currentPopupData?.link_url) {
              window.open(currentPopupData.link_url, "_blank");
              setShowPopup(false);
            }
          }}
        >
          {(isPopupEditMode ? editPopupData : popupData)?.image_url ? (
            // 이미지만 있는 경우 - 설정된 크기에 맞춰 비율 유지하며 표시
            <div
              className={`w-full h-full rounded-lg overflow-hidden flex justify-center items-center ${isPopupEditMode ? "" : "cursor-pointer hover:opacity-90 transition-opacity"}`}
              onClick={(e) => {
                if (isPopupEditMode) return;
                e.stopPropagation();
                const currentPopupData = popupData || editPopupData;
                if (currentPopupData?.link_url) {
                  window.open(currentPopupData.link_url, "_blank");
                  setShowPopup(false);
                }
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={(isPopupEditMode ? editPopupData : popupData).image_url}
                alt={(isPopupEditMode ? editPopupData : popupData).title || "팝업 이미지"}
                className="w-full h-full object-contain"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            </div>
          ) : (
            // 텍스트만 있는 경우
            <div className="p-6">
              <DialogHeader>
                {(isPopupEditMode ? editPopupData : popupData)?.title && (
                  <DialogTitle className="text-2xl">{(isPopupEditMode ? editPopupData : popupData).title}</DialogTitle>
                )}
                {(isPopupEditMode ? editPopupData : popupData)?.content && (
                  <DialogDescription className="text-base pt-2">
                    {(isPopupEditMode ? editPopupData : popupData).content}
                  </DialogDescription>
                )}
              </DialogHeader>
              {(isPopupEditMode ? editPopupData : popupData)?.link_url && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">{(isPopupEditMode ? editPopupData : popupData).link_text || "클릭하여 자세히 보기"}</p>
                </div>
              )}
            </div>
          )}

          {/* 편집 모드: 리사이즈 핸들 및 완료 버튼 */}
          {isPopupEditMode && (
            <>
              <div
                className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize resize-handle z-30 bg-primary/80 hover:bg-primary transition-colors"
                style={{
                  clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsResizingPopup(true);
                  const popupElement = (e.currentTarget as HTMLElement).closest('[role="dialog"]') as HTMLElement;
                  if (popupElement) {
                    const currentWidth = popupElement.offsetWidth || parseInt(editPopupData?.max_width) || 250;
                    const currentHeight = popupElement.offsetHeight || parseInt(editPopupData?.max_height) || 300;
                    setResizeStart({
                      width: currentWidth,
                      height: currentHeight,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }
                }}
                title="크기 조절"
              />
              {/* 편집 모드 설정 패널 */}
              <div className="absolute top-4 left-4 z-30 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-session-once"
                    checked={editPopupData?.show_once_per_session || false}
                    onChange={(e) => {
                      setEditPopupData(prev => ({
                        ...prev,
                        show_once_per_session: e.target.checked,
                      }));
                      const updatedData = { ...editPopupData, show_once_per_session: e.target.checked };
                      localStorage.setItem('popupEditData', JSON.stringify(updatedData));
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="edit-session-once" className="text-sm font-medium cursor-pointer">
                    세션당 한 번만 표시
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="edit-priority" className="text-sm font-medium">
                    우선순위:
                  </label>
                  <input
                    type="number"
                    id="edit-priority"
                    value={editPopupData?.priority ?? 1000}
                    onChange={(e) => {
                      const priority = parseInt(e.target.value) || 1000;
                      setEditPopupData(prev => ({
                        ...prev,
                        priority: priority,
                      }));
                      const updatedData = { ...editPopupData, priority: priority };
                      localStorage.setItem('popupEditData', JSON.stringify(updatedData));
                    }}
                    className="w-20 h-8 px-2 text-sm border rounded"
                    min="1"
                    max="9999"
                  />
                </div>
              </div>
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // 편집 완료 - isEditing 플래그 제거
                    const finalData = { ...editPopupData, isEditing: false };
                    localStorage.setItem('popupEditData', JSON.stringify(finalData));
                    window.close();
                  }}
                >
                  완료
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.close();
                  }}
                >
                  취소
                </Button>
              </div>
            </>
          )}

          {/* 일반 모드: 닫기 버튼 */}
          {!isPopupEditMode && (
            <div className="flex gap-2 p-2 pt-0 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDontShowFor24Hours();
                }}
              >
                24시간 동안 보지 않기
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(false);
                }}
              >
                닫기
              </Button>
            </div>
          )}

          {/* 편집 모드: 닫기 버튼 (편집 모드에서도 버튼 표시) */}
          {isPopupEditMode && (
            <div className="flex gap-2 p-2 pt-0 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // 편집 모드에서는 버튼 클릭 시 아무 동작 안 함 (또는 편집 취소)
                }}
                disabled
              >
                24시간 동안 보지 않기
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // 편집 모드에서는 취소와 동일하게 동작
                  window.close();
                }}
              >
                닫기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
