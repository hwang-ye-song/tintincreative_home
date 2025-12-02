import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  const handleConsultationClick = () => {
    // 구글 폼을 새 창에서 열기
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="logo-gradient">REALIZE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('hero')} 
              className={`text-foreground hover:text-primary transition-colors ${activeSection === 'hero' ? 'text-primary font-semibold' : ''}`}
            >
              홈
            </button>
            <button 
              onClick={() => scrollToSection('curriculum')} 
              className={`text-foreground hover:text-primary transition-colors ${activeSection === 'curriculum' ? 'text-primary font-semibold' : ''}`}
            >
              커리큘럼
            </button>
            <button 
              onClick={() => scrollToSection('portfolio')} 
              className={`text-foreground hover:text-primary transition-colors ${activeSection === 'portfolio' ? 'text-primary font-semibold' : ''}`}
            >
              포트폴리오
            </button>
            <button onClick={handleConsultationClick} className="cta-btn">
              수강 상담하기
            </button>
            {user ? (
              <Link to="/mypage">
                <Button variant="outline">마이페이지</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline">로그인</Button>
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
            {user ? (
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
