import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { smoothScrollTo } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// 구글 폼 URL - 환경 변수에서 가져오거나 직접 설정
// 편집 링크를 제출 링크로 변환 (edit -> viewform)
const getGoogleFormUrl = () => {
  const envUrl = import.meta.env.VITE_GOOGLE_FORM_URL;
  if (envUrl) {
    // 환경 변수에 URL이 있으면 사용
    return envUrl.replace('/edit', '/viewform');
  }
  // 기본값: 제공된 구글 폼 URL
  return "https://docs.google.com/forms/d/e/1FAIpQLSeIJyroJdeZfc_5phn0sFBvbXjQoWj9hSjopaVJahLBq5AYhA/viewform?usp=header";
};

const GOOGLE_FORM_URL = getGoogleFormUrl();

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { user, isAdminOrTeacher, isLoading: isCheckingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const scrollToSection = (sectionId: string) => {
    if (!isHome) {
      navigate(`/?section=${sectionId}`);
      setIsOpen(false);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      // Navbar 높이를 고려하여 정확한 위치로 스크롤
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 60;
      const elementPosition = element.getBoundingClientRect().top;
      // 모든 섹션 동일하게 처리 (포트폴리오와 동일)
      const extraOffset = 0;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - extraOffset;

      // 커스텀 부드러운 스크롤 사용
      smoothScrollTo(offsetPosition, 800);
      setIsOpen(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isHome) {
      // 홈 페이지에 있으면 맨 위로 즉시 부드럽게 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 다른 페이지에 있으면 홈으로 이동
      navigate('/');
    }
  };

  const handleConsultationClick = () => {
    // 구글 폼을 새 창에서 열기
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // useAuth 훅이 인증 상태를 관리하므로 별도의 useEffect 불필요

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'curriculum', 'portfolio', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="logo-gradient text-sm md:text-base lg:text-lg">틴틴AI로봇아카데미</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 md:gap-4 lg:gap-8 flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')} 
              className={`text-xs md:text-sm lg:text-base text-foreground hover:text-primary transition-colors whitespace-nowrap ${activeSection === 'hero' ? 'text-primary font-semibold' : ''}`}
            >
              홈
            </button>
            {!isCheckingAuth && isAdminOrTeacher && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm text-foreground hover:text-primary px-2 md:px-3">
                  관리자
                </Button>
              </Link>
            )}
            <button 
              onClick={() => scrollToSection('curriculum')} 
              className={`text-xs md:text-sm lg:text-base text-foreground hover:text-primary transition-colors whitespace-nowrap ${activeSection === 'curriculum' ? 'text-primary font-semibold' : ''}`}
            >
              커리큘럼
            </button>
            <button 
              onClick={() => scrollToSection('portfolio')} 
              className={`text-xs md:text-sm lg:text-base text-foreground hover:text-primary transition-colors whitespace-nowrap ${activeSection === 'portfolio' ? 'text-primary font-semibold' : ''}`}
            >
              포트폴리오
            </button>
            <button onClick={handleConsultationClick} className="cta-btn text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 whitespace-nowrap">
              상담하기
            </button>
            {isCheckingAuth ? (
              <div className="w-16 md:w-20 h-7 md:h-9" /> // 로딩 중일 때 공간 유지
            ) : user ? (
              <Link to="/mypage">
                <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap">마이페이지</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap">로그인</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button
              onClick={() => scrollToSection('hero')}
              className={`block w-full text-left text-foreground hover:text-primary transition-colors ${activeSection === 'hero' ? 'text-primary font-semibold' : ''}`}
            >
              홈
            </button>
            {!isCheckingAuth && isAdminOrTeacher && (
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-left justify-start">
                  관리자 페이지
                </Button>
              </Link>
            )}
            <button
              onClick={() => scrollToSection('curriculum')}
              className={`block w-full text-left text-foreground hover:text-primary transition-colors ${activeSection === 'curriculum' ? 'text-primary font-semibold' : ''}`}
            >
              커리큘럼
            </button>
            <button
              onClick={() => scrollToSection('portfolio')}
              className={`block w-full text-left text-foreground hover:text-primary transition-colors ${activeSection === 'portfolio' ? 'text-primary font-semibold' : ''}`}
            >
              포트폴리오
            </button>
            <button onClick={handleConsultationClick} className="cta-btn w-full">
              수강 상담하기
            </button>
            {isCheckingAuth ? (
              <div className="w-full h-10" /> // 로딩 중일 때 공간 유지
            ) : user ? (
              <Link to="/mypage">
                <Button variant="outline" className="w-full">마이페이지</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="w-full">로그인</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
