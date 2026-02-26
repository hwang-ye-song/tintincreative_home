import React, { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code, CheckCircle, ArrowRight, Trophy, Gamepad2, Award, TrendingUp, Mic, Scale, RotateCcw, Box, Wand2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const AIPythonMasterClass = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo(0, 0);
  }, []);

  const weekData = [
    {
      week: "01",
      icon: <Mic className="w-6 h-6" />,
      title: "컴퓨터 길들이기",
      subtitle: "입출력과 변수",
      items: [
        "Print & Input 대화하기",
        "변수는 데이터 상자",
        "형변환 마법 (int, str)"
      ],
      level: "B5",
      problems: "백준 2557, 10869"
    },
    {
      week: "02",
      icon: <Scale className="w-6 h-6" />,
      title: "컴퓨터의 판단력",
      subtitle: "조건문 (If / Else)",
      items: [
        "참(True)과 거짓(False)",
        "비교 연산자 심판 보기",
        "들여쓰기 감옥 탈출"
      ],
      level: "B5",
      problems: "백준 1330, 9498"
    },
    {
      week: "03",
      icon: <RotateCcw className="w-6 h-6" />,
      title: "무한 반복의 힘",
      subtitle: "반복문 (For / While)",
      items: [
        "range() 마법 주문",
        "무한루프와 Break",
        "Up & Down 게임 만들기"
      ],
      level: "B5",
      problems: "백준 2741, 10952"
    },
    {
      week: "04",
      icon: <Box className="w-6 h-6" />,
      title: "데이터 보물상자",
      subtitle: "자료구조 (List / Dict)",
      items: [
        "리스트 기차와 인덱스",
        "딕셔너리 이름표 붙이기",
        "슬라이싱으로 자르기"
      ],
      level: "B2",
      problems: "백준 10818, 3052"
    },
    {
      week: "05",
      icon: <Wand2 className="w-6 h-6" />,
      title: "마법의 주문서",
      subtitle: "함수 (Function)",
      items: [
        "Def: 나만의 명령어",
        "Return: 자판기 원리",
        "백준 '이상한 기호' 풀이"
      ],
      level: "B5",
      problems: "백준 15964, 2475"
    },
    {
      week: "06",
      icon: <Trophy className="w-6 h-6" />,
      title: "COS Pro 필살기",
      subtitle: "실전 알고리즘 패턴",
      items: [
        "수학 도우미 (Sum/Max)",
        "숨은 그림 찾기 (Index)",
        "Solution 함수 정복"
      ],
      level: "B2",
      problems: "백준 10871, 10807"
    }
  ];

  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "게임처럼 배우는 코딩",
      description: "지루한 이론은 없습니다. Up & Down 게임, 로켓 발사 등 흥미로운 예제로 자연스럽게 문법을 익힙니다."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "백준(BOJ) 완벽 연동",
      description: "매주 엄선된 백준 문제 풀이를 통해 브론즈 티어 탈출부터 실버 티어 진입까지 실력을 증명합니다."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "COS Pro 자격증 대비",
      description: "단순 취미를 넘어, 6주차에는 실제 자격증 시험에 나오는 필수 유형을 집중 공략합니다."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI 프로그래밍 입문 - 틴틴AI로봇아카데미</title>
        <meta name="description" content="Python과 머신러닝 라이브러리를 활용한 실습. 6주 완성 파이썬 마스터 클래스입니다." />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-[80px] -z-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <button
                onClick={() => navigate("/?section=curriculum")}
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                커리큘럼으로 돌아가기
              </button>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                상상을 현실로 만드는<br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  코딩의 시작
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                복잡한 문법은 이제 그만. 직관적인 비유와 실전 예제로 배우는 틴틴AI로봇아카데미만의 6주 완성 파이썬 마스터 클래스입니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="https://www.ybmit.com/m/index_m.jsp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-10 py-4 bg-foreground text-background rounded-full font-bold hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  COS Pro 란? <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="relative lg:h-full flex justify-center items-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <img 
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop" 
                  alt="Coding Setup" 
                  className="relative rounded-3xl shadow-2xl border-4 border-background transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">6주 완성 로드맵</h2>
            <p className="text-muted-foreground text-lg">기초 문법부터 알고리즘 문제 해결까지, 체계적으로 설계되었습니다.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weekData.map((week, index) => (
              <Card 
                key={week.week} 
                className="relative overflow-hidden hover:shadow-lg transition-all hover:-translate-y-2 border-border/50 bg-background/90 backdrop-blur-sm"
                style={{
                  animation: 'fadeInScale 0.5s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px) scale(0.95)',
                }}
              >
                <CardContent className="p-8 relative">
                  <span className="absolute top-0 right-4 text-8xl font-black text-primary/10 leading-none">
                    {week.week}
                  </span>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                      {week.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{week.title}</h3>
                    <p className="text-muted-foreground mb-6 font-medium">{week.subtitle}</p>
                    
                    <ul className="space-y-3 mb-6">
                      {week.items.map((item, idx) => (
                        <li key={idx} className="flex items-center text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4 border-t border-border">
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {week.level}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" 
                alt="Students Collaboration" 
                className="rounded-[40px] shadow-2xl border-8 border-background"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-6">
                왜 <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">틴틴AI로봇아카데미</span> 인가요?
              </h2>
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden text-center">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">지금 바로 시작하세요</h2>
          <p className="text-xl text-muted-foreground mb-10">
            코딩, 더 이상 미루지 마세요. 틴틴AI로봇아카데미가 여러분의 첫 걸음을 응원합니다.
          </p>
          <PaymentButton
            amount={99000}
            orderName="AI 프로그래밍 입문 수강 신청"
            curriculumId="basic-2"
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            수강 신청하러 가기 <ArrowRight className="ml-2 w-5 h-5" />
          </PaymentButton>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIPythonMasterClass;

