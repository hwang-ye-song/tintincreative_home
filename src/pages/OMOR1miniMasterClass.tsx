import React, { useState, useEffect } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Bot, Map, Terminal, CheckCircle, 
  ArrowRight, Cpu, Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

/* --- Visual Components (CSS Art Replacement for Images) --- */

const VisualPlaceholder = ({ icon: Icon, color, title, sub }: { icon: React.ElementType; color: string; title: string; sub: string }) => (
  <div className="w-full h-full min-h-[300px] bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center z-10 animate-pulse">
        <Icon size={64} className="text-slate-800" />
    </div>
    {/* Decorative Circles */}
    <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white rounded-full opacity-50 blur-xl" />
    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white rounded-full opacity-50 blur-xl" />
    
    <div className="absolute bottom-6 text-center z-10">
        <p className="font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
);

/* --- Main Page Component --- */

const OMOR1miniMasterClass = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00AFFF] selection:text-white">
      <Helmet>
        <title>로봇공학 트랙 - 자율주행 - 틴틴AI로봇아카데미</title>
        <meta name="description" content="ROS1 Melodic 환경 구축부터 SLAM, Navigation, 그리고 실전 자율주행 프로젝트까지. 로봇 제어의 미래, 지금 시작됩니다." />
      </Helmet>

      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-[#00AFFF] to-[#7B61FF] rounded-full opacity-[0.05] blur-[100px]" />
      </div>

      <Navbar />
      
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <Link to="/?section=curriculum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors animate-fade-in">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            커리큘럼으로 돌아가기
          </Link>
          
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4">틴틴AI로봇아카데미</Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              로봇공학 트랙 - 자율주행
            </h1>
            <p className="text-xl md:text-2xl text-primary font-medium mb-4">0 to Autonomous</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ROS1 Melodic 환경 구축부터 SLAM, Navigation, 그리고 실전 자율주행 프로젝트까지.
            </p>
          </div>

          {/* Why Section */}
          <section id="why" className="mb-20">
            <div className="text-center mb-12">
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">왜 틴틴AI로봇아카데미인가?</h2>
                <p className="text-muted-foreground">이론과 실무의 완벽한 조화, 검증된 커리큘럼</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-[#00AFFF]">
                    <Terminal size={28} />
                  </div>
                  <CardTitle>ROS1 Melodic 마스터</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    복잡한 환경 설정부터 핵심 명령어까지. Ubuntu 18.04 위에서 OMO R1mini를 완벽하게 제어하는 법을 배웁니다.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 text-[#7B61FF]">
                    <Layers size={28} />
                  </div>
                  <CardTitle>Sensor Fusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    단순 주행이 아닙니다. Jetson 기반의 LiDAR와 카메라 데이터를 수집하고 시각화(RViz)하여 로봇의 눈을 틔웁니다.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500">
                    <Map size={28} />
                  </div>
                  <CardTitle>SLAM & Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    스스로 지도를 그리고(Mapping) 목적지까지 찾아가는(Navigation) 자율주행의 핵심 파이프라인을 구축합니다.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Week 1: Setup */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">1주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Environment Engineering
                </h2>
                <h3 className="text-xl font-semibold mb-4 text-primary">기본 셋팅 및 환경 구축</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                   로봇 공학의 시작은 올바른 환경 설정입니다. Ubuntu와 ROS의 세계에 입문하고, OMO R1mini와의 첫 교감을 시작합니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "Ubuntu 18.04 기본 명령어 및 ROS Melodic 설치",
                    "OMO R1mini 패키지 설치 및 SSH 원격 제어 설정",
                    "로봇 Bringup 및 Teleop(키보드 제어) 실습"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-[#00AFFF]" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px]">
                <VisualPlaceholder 
                    icon={Terminal} 
                    color="from-blue-500 to-cyan-500" 
                    title="ROS1 Environment" 
                    sub="Ubuntu 18.04 / Melodic" 
                />
              </div>
            </div>
          </section>

          {/* Week 2: Sensors */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 relative h-[400px]">
                 <VisualPlaceholder 
                    icon={Layers} 
                    color="from-purple-500 to-pink-500" 
                    title="Sensor Data" 
                    sub="LiDAR & Camera" 
                />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4" variant="outline">2주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Perception Engineering
                </h2>
                <h3 className="text-xl font-semibold mb-4 text-accent">센서 데이터 시각화 및 활용</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  로봇이 세상을 인식하는 방법. 카메라와 라이다(LiDAR) 센서 데이터를 직접 다루고, UDEV 설정으로 하드웨어를 제어합니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "Jupyter Notebook 설치 및 데이터 분석 환경 구성",
                    "Jetson 기반 카메라 / LiDAR 데이터 수집",
                    "RViz를 활용한 실시간 센서 데이터 시각화",
                    "UDEV 설정을 통한 디바이스 포트 고정"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-[#7B61FF]" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Week 3: SLAM & Nav */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">3주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Autonomous Navigation
                </h2>
                <h3 className="text-xl font-semibold mb-4 text-primary">SLAM & Navigation</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                   자율주행의 꽃. 미지의 공간을 탐색하며 지도를 그리고, 생성된 지도를 바탕으로 최적의 경로를 주행합니다.
                </p>
                <ul className="space-y-4">
                   {[
                    "로봇 모터 기어비 튜닝 및 캘리브레이션",
                    "Gmapping 알고리즘을 이용한 정밀 지도 작성(Mapping)",
                    "Navigation 스택 구성 및 경로 계획(Global/Local Planner)",
                    "목적지 설정 및 자율 주행 테스트"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-[#00AFFF]" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px]">
                <VisualPlaceholder 
                    icon={Map} 
                    color="from-emerald-400 to-teal-500" 
                    title="SLAM & Nav" 
                    sub="Mapping & Path Planning" 
                />
              </div>
            </div>
          </section>

           {/* Week 4-5: Projects */}
          <section className="mb-20" id="projects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 relative h-[400px]">
                 <VisualPlaceholder 
                    icon={Bot} 
                    color="from-amber-400 to-orange-500" 
                    title="Final Project" 
                    sub="Autonomous Mission" 
                />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4" variant="outline">4-5주차 [Project]</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Mission: Autonomous
                </h2>
                <h3 className="text-xl font-semibold mb-4 text-accent">실전 프로젝트 & 최적화</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  단순 실습을 넘어선 실전. 직접 파라미터를 튜닝하며 주행 정확도와 속도를 개선하고, 나만의 자율주행 파이프라인을 완성합니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "최종 프로젝트 팀 구성 및 기획",
                    "장애물 회피 및 동적 경로 생성 알고리즘 고도화",
                    "주행 파라미터(Costmap, Planner) 튜닝을 통한 성능 개선",
                    "최종 결과물 시연 및 문제 해결 과정 공유(Troubleshooting)"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-[#7B61FF]" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Curriculum Overview Grid */}
          <section id="curriculum" className="mb-20">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12 text-center">
              커리큘럼 한눈에 보기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { week: "1주차", title: "기본 셋팅 및 환경 구축", desc: "ROS Melodic 환경 구축, 기본 명령어, OMO R1mini 연결 및 제어", border: "border-l-[#00AFFF]" },
                { week: "2주차", title: "센서 활용 (Vision/LiDAR)", desc: "Jupyter Notebook, 카메라/LiDAR 데이터 수집 및 RViz 시각화", border: "border-l-[#00AFFF]" },
                { week: "3주차", title: "SLAM & Navigation", desc: "Gmapping 지도 생성, Navigation 스택 구성, 경로 탐색 실습", border: "border-l-[#00AFFF]" },
                { week: "4-5주차 (Pro)", title: "실전 프로젝트", desc: "자율주행 미션 수행, 알고리즘 최적화, 최종 발표 및 수료", border: "border-l-[#7B61FF] bg-gradient-to-r from-purple-50 to-white", badgeVariant: "outline" as const }
              ].map((item, idx) => (
                <Card key={idx} className={`border-l-4 ${item.border}`}>
                  <CardHeader>
                    <Badge variant={item.badgeVariant || "default"} className="w-fit mb-2">{item.week}</Badge>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600">
                      {item.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p className="text-xl text-muted-foreground mb-4">성장할 준비가 되셨나요?</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              자율주행 엔지니어로의<br />여정을 시작하세요
            </h2>
            <PaymentButton
              amount={99000}
              orderName="로봇공학 트랙 - 자율주행"
              curriculumId="robot"
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all"
            >
              수강 신청하기
            </PaymentButton>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OMOR1miniMasterClass;

