import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Map, Terminal, CheckCircle, 
  ArrowLeft, Cpu, Layers, Radar, Sparkles, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

/* --- Robotics Hero Composite Component --- */
export const RoboticsHeroComposite = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto h-[450px] md:h-[550px] perspective-1000 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10 overflow-visible">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-[80px] -z-10" />

        <div className="relative w-full h-full flex items-center justify-center z-30">
          {/* Left Floating Card: LiDAR Data */}
          <div className="hidden md:block w-[180px] bg-[#2D2D2D] dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-slate-700/50 p-4 z-40 animate-float-medium transform -rotate-6 absolute left-4 md:left-10 bottom-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg"><Radar size={14} /></div>
              <span className="text-xs font-bold text-white">LiDAR View</span>
            </div>
            <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-full border border-green-500/30 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 border border-green-500/10 rounded-full scale-50" />
               <div className="absolute inset-0 border border-green-500/10 rounded-full scale-75" />
               {/* Crosshair */}
               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-green-500/70 transform -translate-y-1/2" />
               <div className="absolute left-1/2 top-0 h-full w-[1px] bg-green-500/70 transform -translate-x-1/2" />
               {/* Scanning Line */}
               <div 
                 className="absolute w-full h-[1px] bg-green-500/50 top-1/2 left-0"
                 style={{
                   animation: 'spin 2s linear infinite'
                 }}
               />
               <div className="absolute top-2 left-10 w-1.5 h-1.5 bg-red-500 rounded-full" />
               <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-red-500 rounded-full" />
               <div className="absolute top-8 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </div>
          </div>

          {/* Main Screen: ROS Terminal & Simulation (Center) */}
          <div className="relative w-[82%] md:w-[70%] lg:w-[62%] max-w-3xl bg-[#1E1E1E] dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-30 animate-float-slow group">
            {/* Header */}
            <div className="bg-[#2D2D2D] border-b border-black/20 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 text-xs text-muted-foreground font-mono flex items-center gap-2">
                <Terminal size={12} /> student@omo-r1mini:~/catkin_ws
              </div>
            </div>
            {/* Content */}
            <div className="p-0 flex flex-col h-[320px]">
              {/* Split View: Terminal & Sim */}
              <div className="flex-1 flex">
                  {/* Left: Terminal */}
                  <div className="w-1/2 p-4 font-mono text-xs text-green-400 border-r border-white/10 overflow-hidden bg-[#1E1E1E]">
                      <p className="opacity-50">$ roslaunch omo_r1mini_bringup omo_r1mini_robot.launch</p>
                      <p className="text-white mt-2">[INFO] [16321.22] Controller Spawner: Loaded controllers: joint_state_controller, diff_drive_controller</p>
                      <p className="text-white">[INFO] [16321.45] OMO R1mini Connected.</p>
                      <p className="text-blue-400 mt-2">$ roslaunch turtlebot3_slam turtlebot3_slam.launch</p>
                      <p className="text-white">[INFO] [16345.11] SLAM: Gmapping</p>
                      <p className="text-yellow-400 mt-2">[WARN] Map update loop started.</p>
                      <div className="mt-2 animate-pulse">_</div>
                  </div>
                  
                  {/* Right: Simulation View */}
                  <div className="w-1/2 bg-[#000] relative flex items-center justify-center overflow-hidden">
                      {/* Background Image: Point Cloud Map */}
                      <img 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" 
                        alt="LiDAR Point Cloud Map"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Grid Overlay */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                          backgroundSize: '30px 30px'
                        }}
                      ></div>
                      
                      {/* Scanning Effect */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/20 to-transparent origin-center rounded-full"
                        style={{
                          animation: 'spin 4s linear infinite',
                          transform: 'scale(2.5)'
                        }}
                      />
                      
                      {/* Robot Icon */}
                      <div className="relative z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-2 border-white" style={{ boxShadow: '0 0 30px hsl(var(--primary))' }}>
                          <Bot className="text-white" size={20} />
                          <div className="absolute inset-0 border border-white/50 rounded-full animate-ping" />
                      </div>
                      
                      {/* Path Line */}
                      <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-primary to-transparent transform -translate-y-1/2 translate-x-5 rotate-12 rounded-full blur-[1px]" />
                      
                      {/* UI Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-green-400 font-mono border border-green-900">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          LiDAR: Active
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Right Floating Card: SLAM Map */}
          <div className="hidden md:block w-[180px] bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 animate-float-fast transform rotate-6 absolute right-4 md:right-10 bottom-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-accent/20 text-accent rounded-lg"><Map size={14} /></div>
              <span className="text-xs font-bold text-slate-800">SLAM Map</span>
            </div>
            <div className="w-full bg-muted rounded-lg h-24 p-2 relative overflow-hidden">
               <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-border border-dashed rounded" />
               <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-accent rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />
               <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-accent/50 transform rotate-45 origin-left" />
               <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground font-mono">
                  Global_Costmap
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Course Visual Component --- */
const CourseVisual = ({ imageSrc, alt, title, sub, icon: FallbackIcon = Sparkles }: { imageSrc: string; alt: string; title: string; sub: string; icon?: React.ElementType }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-[32px] border border-border relative overflow-hidden group shadow-xl">
      <div className="absolute inset-0">
        {!imgError ? (
          <img 
            src={imageSrc} 
            alt={alt} 
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[100px] opacity-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full filter blur-[100px] opacity-20" />
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              {FallbackIcon && <FallbackIcon size={64} strokeWidth={1} />}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 mix-blend-multiply" />
      </div>
      
      <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary))]" />
          <p className="text-xs font-semibold tracking-wider uppercase text-primary">{sub}</p>
        </div>
        <p className="font-bold text-xl leading-tight text-white">{title}</p>
      </div>
    </div>
  );
};

/* --- Main Page Component --- */

const OMOR1miniMasterClass = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background font-sans">
      <Helmet>
        <title>로봇공학 트랙 - 자율주행 - 틴틴AI로봇아카데미</title>
        <meta name="description" content="ROS1 Melodic 환경 구축부터 SLAM, Navigation, 그리고 실전 자율주행 프로젝트까지. 로봇 제어의 미래, 지금 시작됩니다." />
      </Helmet>

      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => navigate("/?section=curriculum")}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            커리큘럼으로 돌아가기
          </button>
          
          {/* Hero Section */}
          <div className="flex flex-col items-center mb-24 animate-fade-in relative">
            <div className="text-center max-w-3xl mb-12 relative z-10">
              <Badge className="mb-6 px-4 py-1 text-sm">Robotics Master Class</Badge>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                OMO R1mini <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Autonomous Driving
                </span>
              </h1>
              <p className="text-2xl text-foreground font-bold mb-4">ROS1 Melodic to SLAM</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ubuntu 18.04 환경 구축부터 센서 퓨전, SLAM, 그리고 자율주행까지.<br/>
                이론을 넘어 내 손으로 움직이는 로봇을 완성하세요.
              </p>
            </div>

            {/* Robot Image */}
            <div className="w-full max-w-4xl relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <img 
                  src="/images/omo_r1mini_robots.png" 
                  alt="OMO R1mini Basic and Pro Robots"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
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
                <CourseVisual 
                  imageSrc="/images/robot_week1.png"
                  alt="ROS Code Environment"
                  title="ROS Environment" 
                  sub="Week 1" 
                  icon={Terminal}
                />
              </div>
            </div>
          </section>

          {/* Week 2: Sensors */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 relative h-[400px]">
                <CourseVisual 
                  imageSrc="/images/robot_week2.png"
                  alt="Robot Sensor Tech"
                  title="Sensor Fusion" 
                  sub="Week 2" 
                  icon={Radar}
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
                <CourseVisual 
                  imageSrc="/images/robot_week3.png"
                  alt="Digital Map Navigation"
                  title="SLAM & Navigation" 
                  sub="Week 3-5" 
                  icon={Map}
                />
              </div>
            </div>
          </section>

           {/* Week 4-5: Projects */}
          <section className="mb-20" id="projects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 relative h-[400px]">
                <CourseVisual 
                  imageSrc="/images/robot_week4.png"
                  alt="Autonomous Robot Mission"
                  title="Final Project" 
                  sub="Week 4-5" 
                  icon={Bot}
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

          {/* Caution & Requirements */}
          <section className="mb-20" id="requirements">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 flex-shrink-0">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4">수강 전 확인사항</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3 text-amber-900/80 dark:text-amber-200/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span><strong>파이썬(Python) 언어</strong>에 대한 기본적인 이해도가 필요합니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span>실제 로봇을 다루므로 <strong>안전 수칙</strong>을 반드시 준수해야 합니다.</span>
                    </li>
                  </ul>
                  <ul className="space-y-3 text-amber-900/80 dark:text-amber-200/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span>강사의 실습 지시에 따르지 않을 경우 기기 파손의 위험이 있습니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span>개인 노트북(Windows/Mac) 지참이 권장됩니다.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-20 bg-muted/30 rounded-[40px] border border-border">
            <div className="max-w-3xl mx-auto px-6">
              <p className="text-xl text-primary font-semibold mb-4">Build Your Own Robot</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                자율주행 엔지니어로의 첫 걸음,<br />
                틴틴AI로봇아카데미에서 시작하세요.
              </h2>
              <PaymentButton
                amount={99000}
                orderName="로봇공학 트랙 - 자율주행"
                curriculumId="robot"
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all shadow-lg shadow-primary/25"
              >
                수강 신청하기
              </PaymentButton>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OMOR1miniMasterClass;

