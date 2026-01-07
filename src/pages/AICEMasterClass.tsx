import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Code, Award, CheckCircle, MessageCircle, Cpu, Camera, Layers, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const AICEMasterClass = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo(0, 0);
    
    // Scroll handler for navbar effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const curriculum = [
    {
      week: "1주차",
      title: "AI 첫걸음 & 툴 마스터",
      desc: "인공지능의 기본 개념을 이해하고 실습 환경(AIDU/Entry)과 친해지는 시간입니다.",
      icon: <Brain className="w-6 h-6 text-white" />,
      tags: ["AI 개념", "툴 익히기", "챗봇 실습"]
    },
    {
      week: "2주차",
      title: "데이터가 만드는 지능",
      desc: "머신러닝의 핵심인 '지도학습'을 배우고 데이터를 분류하는 모델을 만듭니다.",
      icon: <Layers className="w-6 h-6 text-white" />,
      tags: ["지도학습", "데이터 분류", "텍스트 분석"]
    },
    {
      week: "3주차",
      title: "소리로 명령하는 AI",
      desc: "음성 인식(STT)과 합성(TTS) 기술을 활용해 나만의 통역기와 비서를 구현합니다.",
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      tags: ["음성 인식", "오디오 데이터", "AI 비서"]
    },
    {
      week: "4주차",
      title: "눈으로 보는 AI (Vision)",
      desc: "이미지 데이터를 학습시켜 사물을 인식하고 반응하는 로봇을 제작합니다.",
      icon: <Camera className="w-6 h-6 text-white" />,
      tags: ["이미지 학습", "사물 인식", "마스크 판별"]
    },
    {
      week: "5주차",
      title: "종합 프로젝트 & 알고리즘",
      desc: "AI 모델과 코딩 알고리즘을 결합하여 복합적인 문제를 해결하는 심화 과정입니다.",
      icon: <Cpu className="w-6 h-6 text-white" />,
      tags: ["알고리즘 결합", "오류 수정", "종합 프로젝트"]
    },
    {
      week: "6주차",
      title: "Final 실전 모의고사",
      desc: "실제 시험 환경과 동일한 조건에서 모의고사를 진행하고 최종 점검을 마칩니다.",
      icon: <Award className="w-6 h-6 text-white" />,
      tags: ["실전 모의고사", "오답 노트", "합격 전략"]
    }
  ];

  const features = [
    {
      icon: <Code className="w-7 h-7" />,
      title: "블록 코딩으로 쉽게",
      desc: "복잡한 언어 없이도 블록을 조립하며 AI의 원리를 직관적으로 이해합니다."
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "컴퓨팅 사고력 향상",
      desc: "문제를 정의하고 데이터를 활용해 해결하는 논리적 사고력을 키웁니다."
    },
    {
      icon: <Award className="w-7 h-7" />,
      title: "국가 공인 민간 자격",
      desc: "공신력 있는 자격증 취득으로 아이의 성취감과 포트폴리오를 완성합니다."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>기초 트랙 (Perception AI) - 틴틴AI로봇아카데미</title>
        <meta name="description" content="AI와 머신러닝의 기초를 배우세요. AICE Junior 자격증 취득까지 단 6주면 충분합니다." />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <button
                onClick={() => navigate("/?section=curriculum")}
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                커리큘럼으로 돌아가기
              </button>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AICE Junior 6주 완성반 모집 중
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">
                AI 시대를 리드하는<br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  미래 인재의 첫걸음
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                단순한 코딩을 넘어, 인공지능의 원리를 이해하고 직접 구현합니다. 
                KT가 인증하는 AICE Junior 자격증 취득까지 단 6주면 충분합니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href="https://aice.study/main" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  AICE란? (공식 홈페이지) <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="relative lg:h-[600px] w-full flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-background">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" 
                  alt="Student learning AI with teamwork" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent mix-blend-overlay" />
                
                {/* Floating Stats Card */}
                <div className="absolute bottom-8 left-8 bg-background/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-border flex justify-between items-center max-w-xs">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">수강생 만족도</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-extrabold">4.9</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              왜 <span className="text-primary">AICE Junior</span> 인가요?
            </h2>
            <p className="text-muted-foreground">
              AICE(AI Certificate for Everyone)는 KT가 개발하고 한국경제신문이 주관하는 
              국내 최고 권위의 인공지능 활용 능력 자격증입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((item, idx) => (
              <Card key={idx} className="border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Timeline */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-4 py-1 text-sm bg-accent/10 text-accent border-accent/20">
              Curriculum
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">6주 완성 로드맵</h2>
            <p className="text-muted-foreground">기초부터 실전 모의고사까지 빈틈없이 준비했습니다.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {curriculum.map((item, index) => (
              <Card 
                key={index} 
                className="group relative border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{
                  animation: 'fadeInScale 0.5s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px) scale(0.95)',
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <Badge variant="outline" className="group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                      {item.week}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {item.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tIdx) => (
                      <Badge key={tIdx} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-foreground overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80" 
            alt="Futuristic Tech Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-background space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">지금 바로 시작하세요</h2>
            <p className="text-background/70 text-lg max-w-xl">
              우리 아이의 첫 AI 자격증, 틴틴AI로봇아카데미의 전문 강사진이<br className="hidden md:block"/>
              합격의 그날까지 책임지고 지도합니다.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <PaymentButton
              amount={99000}
              orderName="기초 트랙 (Perception AI) 수강 신청"
              curriculumId="basic"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all"
            >
              수강 신청하기
            </PaymentButton>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-background/10 backdrop-blur-sm border-background/20 text-background hover:bg-background/20"
            >
              전화 상담 예약
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AICEMasterClass;

