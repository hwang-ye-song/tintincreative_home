import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CurriculumCard } from "@/components/CurriculumCard";
import { PortfolioCard } from "@/components/PortfolioCard";
import { FacultyCard } from "@/components/FacultyCard";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Brain, Lightbulb, ArrowRight, Rocket } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const location = useLocation();

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
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-4">학습 로드맵</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              기초부터 고급 로봇공학까지 체계적인 학습 경로를 따라가세요
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <div className="flex-1 text-center animate-fade-in hover-scale">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">1. 기초 트랙 (Perception AI)</h3>
              <p className="text-sm text-muted-foreground">AI 개념의 기초</p>
            </div>
            
            <ArrowRight className="hidden md:block h-8 w-8 text-accent animate-pulse" />
            
            <div className="flex-1 text-center animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">2. 응용 트랙 (Generative AI & Agentic AI)</h3>
              <p className="text-sm text-muted-foreground">실제 문제에 AI 적용</p>
            </div>
            
            <ArrowRight className="hidden md:block h-8 w-8 text-accent animate-pulse" />
            
            <div className="flex-1 text-center animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">3. 로봇 트랙</h3>
              <p className="text-sm text-muted-foreground">지능형 로봇 제작</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold mb-4">커리큘럼</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              여러분의 경로를 선택하고 AI와 로봇공학으로 만들기를 시작하세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in hover-scale">
              <CurriculumCard
                id="basic"
                title="기초 트랙 (Perception AI)"
                description="AI와 머신러닝의 기초를 배우세요"
                level="초급"
                duration="12주"
                icon={<Lightbulb className="h-6 w-6" />}
                image="/images/aice.jpg"
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
              <CurriculumCard
                id="application"
                title="응용 트랙 (Generative AI & Agentic AI)"
                description="AI 기술을 실제 문제 해결에 적용하세요"
                level="중급"
                duration="16주"
                icon={<Brain className="h-6 w-6" />}
                image="/images/ai_agent.jpg"
              />
            </div>
            <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <CurriculumCard
                id="robot"
                title="로봇공학 트랙 (Physical AI)"
                description="지능형 로봇을 만들고 프로그래밍하세요"
                level="고급"
                duration="20주"
                icon={<Bot className="h-6 w-6" />}
                image="/images/lerobot.gif"
              />
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
