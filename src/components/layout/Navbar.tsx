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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // 초기값을 false로 설정하여 버튼이 바로 표시되도록
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
      // Navbar 높이를 고려한 offset 계산
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  const handleConsultationClick = () => {
    // 구글 폼을 새 창에서 열기
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  useEffect(() => {
    // Check auth state and user role - 간단하고 빠르게
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          setUser(null);
          setUserRole(null);
          setIsCheckingAuth(false);
          return;
        }
        
        setUser(session.user);
        
        // 프로필 조회는 비동기로 처리 (버튼 표시를 막지 않음)
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserRole(profile?.role || null);
          })
          .catch(() => {
            setUserRole(null);
          });
      } catch (error) {
        setUser(null);
        setUserRole(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session || !session.user) {
          setUser(null);
          setUserRole(null);
          setIsCheckingAuth(false);
          return;
        }
        
        setUser(session.user);
        setIsCheckingAuth(false);
        
        // 프로필 조회는 비동기로 처리
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserRole(profile?.role || null);
          })
          .catch(() => {
            setUserRole(null);
          });
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
            {!isCheckingAuth && userRole === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  관리자 페이지
                </Button>
              </Link>
            )}
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
            {isCheckingAuth ? (
              <div className="w-20 h-9" /> // 로딩 중일 때 공간 유지
            ) : user ? (
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
            {!isCheckingAuth && userRole === 'admin' && (
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
