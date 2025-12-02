import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CurriculumCard } from "@/components/CurriculumCard";
import { PortfolioCard } from "@/components/PortfolioCard";
import { FacultyCard } from "@/components/FacultyCard";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Brain, Lightbulb, ArrowRight, Rocket, Code, Smartphone, Cpu, MessageSquare, Box, ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("전체");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get("section");

    if (target) {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  const scrollToCurriculum = () => {
    const element = document.getElementById("curriculum");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const categories = ["전체", "AI 기초", "AI 활용", "로봇"];
  
  const curriculumData = [
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
      id: "basic-2",
      title: "AI 프로그래밍 입문",
      description: "Python과 머신러닝 라이브러리를 활용한 실습",
      level: "초급",
      duration: "10주",
      icon: <Code className="h-6 w-6" />,
      image: "/images/aice.jpg",
      category: "AI 기초",
    },
    {
      id: "application",
      title: "응용 트랙 (Generative AI & Agentic AI)",
      description: "AI 기술을 실제 문제 해결에 적용하세요",
      level: "중급",
      duration: "16주",
      icon: <Brain className="h-6 w-6" />,
      image: "/images/ai_agent.jpg",
      category: "AI 활용",
    },
    {
      id: "application-2",
      title: "고급 AI 애플리케이션 개발",
      description: "실전 프로젝트를 통한 고급 AI 기술 습득",
      level: "중급",
      duration: "14주",
      icon: <Code className="h-6 w-6" />,
      image: "/images/ai_agent.jpg",
      category: "AI 활용",
    },
    {
      id: "application-3",
      title: "AI 서비스 통합 및 배포",
      description: "AI 모델을 실제 서비스로 배포하고 운영하는 방법",
      level: "중급",
      duration: "18주",
      icon: <Smartphone className="h-6 w-6" />,
      image: "/images/ai_agent.jpg",
      category: "AI 활용",
    },
    {
      id: "application-4",
      title: "AI 챗봇 및 대화형 시스템",
      description: "자연어 처리와 대화형 AI 시스템 구축",
      level: "중급",
      duration: "15주",
      icon: <MessageSquare className="h-6 w-6" />,
      image: "/images/ai_agent.jpg",
      category: "AI 활용",
    },
    {
      id: "robot",
      title: "로봇공학 트랙 (Physical AI)",
      description: "지능형 로봇을 만들고 프로그래밍하세요",
      level: "고급",
      duration: "20주",
      icon: <Bot className="h-6 w-6" />,
      image: "/images/lerobot.gif",
      category: "로봇",
    },
    {
      id: "robot-2",
      title: "로봇 제어 및 센서 통합",
      description: "로봇 하드웨어 제어와 다양한 센서 활용",
      level: "고급",
      duration: "18주",
      icon: <Cpu className="h-6 w-6" />,
      image: "/images/lerobot.gif",
      category: "로봇",
    },
  ];

  const filteredCurriculums = selectedCategory === "전체" 
    ? curriculumData 
    : curriculumData.filter(curriculum => curriculum.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>AI & 로봇공학 아카데미 - 혁신적인 학습 경험</title>
        <meta name="description" content="AI와 로봇공학을 배우는 종합 교육 플랫폼. 기초부터 고급까지 체계적인 커리큘럼으로 전문가가 되세요." />
        <meta property="og:title" content="AI & 로봇공학 아카데미" />
        <meta property="og:description" content="AI와 로봇공학을 배우는 종합 교육 플랫폼" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      
      {/* Hero Section with Canvas Animation */}
      <HeroCanvas />

      {/* Learning Roadmap */}
      <section id="roadmap" className="relative py-20 px-4 min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: '#f0f7ff' }}>
        {/* Background: Large glowing blobs */}
        <div className="absolute top-[-30%] left-[-20%] w-[80vw] h-[80vw] bg-blue-300/30 rounded-full filter blur-[150px] animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[80vw] h-[80vw] bg-purple-300/30 rounded-full filter blur-[150px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-200/20 rounded-full filter blur-[120px] animate-pulse mix-blend-screen" style={{ animationDelay: '4s' }}></div>

        <div className="container mx-auto max-w-7xl relative z-20">
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-16 z-20 text-center relative leading-tight" style={{ color: '#1e293b' }}>
            AI 커리교육
          </h1>
          
          {/* Curriculum Stages Container */}
          <div className="w-full max-w-7xl flex flex-col md:flex-row items-stretch justify-center gap-6 relative z-20 mb-16 px-4 md:px-0">
            {/* STAGE 1 Card */}
            <div className="flex-1 relative p-8 flex flex-col items-center text-center group animate-fade-in"
                 style={{
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
                <div className="mb-3">
                  <span className="font-extrabold text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 1</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: '#3b267d' }}>AI BASIC</h2>
                <p className="text-muted-foreground font-semibold mb-10 text-lg">(기초 다지기)</p>
                
                {/* Stage 1 Visuals */}
                <div className="flex justify-center items-center gap-6 mb-10 h-28">
                  <div className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center"
                       style={{
                         background: 'rgba(219, 234, 254, 0.5)',
                         borderColor: 'rgba(147, 197, 253, 0.5)',
                         boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
                       }}>
                    <Code className="h-12 w-12 text-primary" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  </div>
                  <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center animate-pulse"
                       style={{
                         background: 'rgba(243, 232, 255, 0.5)',
                         borderColor: 'rgba(196, 181, 253, 0.5)',
                         boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                       }}>
                    <Lightbulb className="h-12 w-12 text-accent" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  </div>
                </div>
                
                <p className="text-foreground/70 font-medium leading-relaxed mt-auto">
                  AI 블록코딩 기초를 탄탄히<br />
                  입문하는 기초 강의의 정석
                </p>
              </div>
            </div>
            
            {/* Arrow 1 */}
            <div className="flex items-center justify-center z-10 md:-mx-3">
              <ArrowRight className="h-10 w-10 hidden md:block" 
                          style={{
                            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                          }} />
              <ChevronDown className="h-10 w-10 block md:hidden py-4"
                          style={{
                            background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                          }} />
            </div>
            
            {/* STAGE 2 Card */}
            <div className="flex-1 relative p-8 flex flex-col items-center text-center animate-fade-in"
                 style={{
                   animationDelay: '0.1s',
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
                <div className="mb-3">
                  <span className="font-extrabold text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 2</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 break-keep leading-tight" style={{ color: '#3b267d' }}>SERVICE & AGENT AI</h2>
                <p className="text-muted-foreground font-semibold mb-10 text-lg">(소프트웨어 AI 통합)</p>
                
                {/* Stage 2 Visuals */}
                <div className="flex justify-center items-center relative mb-10 h-28 w-full">
                  {/* Phone Frame */}
                  <div className="w-20 h-32 rounded-[2rem] flex flex-col items-center justify-start absolute left-1/2 transform -translate-x-14 z-10 shadow-lg"
                       style={{
                         border: '5px solid rgba(96, 165, 250, 0.8)',
                         background: 'rgba(255, 255, 255, 0.8)',
                       }}>
                    <div className="w-10 h-1.5 rounded-full mt-3" style={{ background: 'rgba(191, 219, 254, 1)' }}></div>
                    <div className="mt-5 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(219, 234, 254, 1)' }}>
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  {/* Logic Flow */}
                  <div className="absolute left-1/2 transform translate-x-4 flex flex-col gap-3 z-0">
                    <div className="w-14 h-12 rounded-xl flex items-center justify-center shadow-sm"
                         style={{
                           border: '2px solid rgba(196, 181, 253, 0.6)',
                           background: 'rgba(255, 255, 255, 0.8)',
                         }}>
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                    <div className="w-1 h-6 mx-auto" style={{ background: 'rgba(196, 181, 253, 0.5)' }}></div>
                    <div className="w-14 h-12 rounded-xl flex items-center justify-center shadow-sm"
                         style={{
                           border: '2px solid rgba(196, 181, 253, 0.6)',
                           background: 'rgba(255, 255, 255, 0.8)',
                         }}>
                      <Box className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  
                  {/* Connecting Lines */}
                  <svg className="absolute w-24 h-24 left-1/2 -translate-x-8" style={{ zIndex: -1, filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))' }}>
                    <path d="M25 50 C 40 30, 60 30, 75 35" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.6} />
                    <path d="M25 50 C 40 70, 60 70, 75 65" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.6} />
                  </svg>
                </div>
                
                <p className="text-foreground/70 font-medium leading-relaxed mt-auto pt-4">
                  AI 전용헤어 챗봇구축<br />
                  AI(소프트웨어 AI 통합)
                </p>
              </div>
            </div>
            
            {/* Arrow 2 */}
            <div className="flex items-center justify-center z-10 md:-mx-3">
              <ArrowRight className="h-10 w-10 hidden md:block"
                          style={{
                            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                          }} />
              <ChevronDown className="h-10 w-10 block md:hidden py-4"
                          style={{
                            background: 'linear-gradient(to bottom, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
                          }} />
            </div>
            
            {/* STAGE 3 Card */}
            <div className="flex-1 relative p-8 flex flex-col items-center text-center animate-fade-in"
                 style={{
                   animationDelay: '0.2s',
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
                <div className="mb-3">
                  <span className="font-extrabold text-xl tracking-widest" style={{ color: '#00c6ff', textShadow: '0 0 10px rgba(0, 198, 255, 0.3)' }}>STAGE 3</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: '#3b267d' }}>PHYSICAL AI</h2>
                <p className="text-muted-foreground font-semibold mb-10 text-lg">(실전 하드웨어 적용)</p>
                
                {/* Stage 3 Visuals */}
                <div className="flex justify-center gap-6 mb-6 w-full px-4 h-28 items-end">
                  {/* R1 Mini Box */}
                  <div className="flex flex-col items-center transform rotate-[-5deg]">
                    <div className="w-24 h-20 rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden border-b-[6px]"
                         style={{
                           background: 'linear-gradient(to bottom right, #374151, #111827)',
                           borderBottomColor: '#030712',
                         }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
                      <span className="text-gray-200 font-bold text-lg tracking-wider font-mono relative z-10">R1</span>
                    </div>
                    <span className="text-sm font-bold mt-3" style={{ color: '#374151' }}>R1 mini</span>
                  </div>
                  
                  {/* LeRobot */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <Bot className="h-16 w-16" style={{ 
                        background: 'linear-gradient(to bottom, #9ca3af, #4b5563)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                      }} />
                      <div className="absolute bottom-2 w-16 h-4 rounded-full blur-md" style={{ background: 'rgba(59, 130, 246, 0.3)' }}></div>
                    </div>
                    <span className="text-sm font-bold mt-3" style={{ color: '#374151' }}>LeRobot</span>
                  </div>
                </div>
                
                <p className="text-foreground/70 font-medium leading-relaxed mt-auto">
                  LeRobot (R1) 키트를 활용한<br />
                  실전 (실전 하드웨어 적용)
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Text */}
          <footer className="text-center text-muted-foreground font-medium text-base max-w-3xl mx-auto leading-relaxed z-20 px-4 mb-8">
            애플리케이션 개발자를 꿈꾸는 분들을 위한 고품격 AI 교육 커리큘럼을 함께하며<br className="hidden md:block" />
            어떤 해결 문제 정의를 생각한 게 목표와 성장에 중시능합니다.
          </footer>
          
          {/* 자세히 보기 버튼 */}
          <div className="text-center mt-8 z-20">
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
      <section id="curriculum" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-4">커리큘럼 상세</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              각 단계별 상세 커리큘럼을 확인하고 학습을 시작하세요
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                    : "hover:scale-105"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Curriculum Carousel */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-full snap-x snap-mandatory">
              {filteredCurriculums.map((curriculum, index) => (
                <div
                  key={`${selectedCategory}-${curriculum.id}`}
                  className="min-w-[280px] md:min-w-[320px] snap-start"
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
      <section id="portfolio" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-4">학생 프로젝트</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              우리 학생들의 놀라운 작품들을 확인하세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
          </div>
          
          <div className="text-center animate-fade-in">
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
            <h2 className="font-heading text-4xl font-bold mb-4">교수진 소개</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              업계 전문가들과 경험 많은 교육자들로부터 배우세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="animate-fade-in hover-scale">
              <FacultyCard
                name="박지훈 박사"
                title="AI 프로그램 책임자"
                expertise={["머신러닝", "딥러닝", "컴퓨터 비전"]}
                bio="AI 연구 및 교육 분야 15년 경력"
                email="j.park@academy.ai"
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
              <FacultyCard
                name="마리아 가르시아 교수"
                title="로봇공학 책임자"
                expertise={["로봇공학", "임베디드 시스템", "제어 이론"]}
                bio="자율 시스템 전문 전직 NASA 로봇공학 엔지니어"
                email="m.garcia@academy.ai"
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <FacultyCard
                name="리사 웡 박사"
                title="NLP 전문가"
                expertise={["자연어 처리", "AI 윤리", "데이터 과학"]}
                bio="자연어 처리 분야 연구 논문 발표"
                email="l.wong@academy.ai"
              />
            </div>
          </div>
          
          <div className="text-center animate-fade-in">
            <Link to="/faculty">
              <Button variant="outline" size="lg" className="hover-scale">
                전체 교수진 보기
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
              <Button size="lg" className="hover-scale">
                시작하기
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              신용카드 불필요. 14일 무료 체험.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
