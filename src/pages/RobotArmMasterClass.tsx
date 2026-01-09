import React, { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Activity, Database, CheckCircle, ArrowRight, Terminal, Layers, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const RobotArmMasterClass = () => {
  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const features = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Real Hardware Control",
      description: "가상 환경에 그치지 않습니다. Ubuntu 환경에서 드라이버, 권한, 포트를 직접 제어하며 실제 SO-ARM 로봇을 움직입니다.",
      bgColor: "bg-blue-50",
      iconColor: "text-[#00AFFF]"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "End-to-End Pipeline",
      description: "데이터 수집(Teleoperation)부터 AI 모델 학습(Training), 그리고 실제 추론(Inference)까지 전 과정을 마스터합니다.",
      bgColor: "bg-purple-50",
      iconColor: "text-[#7B61FF]"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Open Source AI",
      description: "Hugging Face와 LeRobot 프레임워크를 활용하여 최신 Robotics AI 기술을 내 프로젝트에 즉시 적용합니다.",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-500"
    }
  ];

  const curriculum = [
    {
      week: 1,
      title: "Environment Setup",
      subtitle: "기본 셋팅 & 환경 구축",
      description: "Physical AI를 위한 첫걸음",
      detail: "로봇 제어는 완벽한 환경 설정에서 시작됩니다. Linux(Ubuntu)와 Conda 환경을 구축하고 하드웨어 제어의 기초를 다집니다.",
      items: [
        { title: "Ubuntu Mastery", desc: "터미널 명령어와 권한 관리 완벽 적응" },
        { title: "LeRobot Install", desc: "Conda 환경 설정 및 프레임워크 설치" },
        { title: "Hardware Connection", desc: "SO-ARM 로봇 연결 및 포트 설정" }
      ],
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
      gradient: "from-[#00AFFF] to-[#7B61FF]",
      borderColor: "border-[#00AFFF]"
    },
    {
      week: 2,
      title: "Teleoperation",
      subtitle: "제어 & 캘리브레이션",
      description: "로봇에게 움직임을 가르치다",
      detail: "리더(Leader) 로봇을 통해 팔로워(Follower) 로봇을 제어합니다. 정교한 움직임을 위한 모터 캘리브레이션을 수행합니다.",
      items: [
        { title: "Motor Calibration", desc: "오차 없는 제어를 위한 모터 미세 조정" },
        { title: "Leader-Follower", desc: "실시간 원격 제어(Teleoperation) 구현" },
        { title: "Movement Logic", desc: "로봇 팔의 자유도(DOF)와 움직임 이해" }
      ],
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
      gradient: "from-[#7B61FF] to-[#00AFFF]",
      borderColor: "border-[#00AFFF]"
    },
    {
      week: 3,
      title: "Data Pipeline",
      subtitle: "데이터셋 구축",
      description: "AI 학습의 연료를 만들다",
      detail: "다각도 카메라(위/손목/측면)를 활용해 시각 데이터를 수집하고, 행동 데이터와 동기화하여 완벽한 데이터셋을 구축합니다.",
      items: [
        { title: "Multi-Camera Setup", desc: "다양한 앵글의 시각 정보 동기화" },
        { title: "Data Recording", desc: "Task 수행 데이터 녹화 및 포맷팅" },
        { title: "W&B Integration", desc: "Weights & Biases를 통한 데이터 시각화" }
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      gradient: "from-[#00AFFF] to-[#7B61FF]",
      borderColor: "border-[#00AFFF]"
    },
    {
      week: 4,
      title: "Policy Learning",
      subtitle: "학습 및 자율 구동",
      description: "로봇, 스스로 생각하다",
      detail: "수집한 데이터로 정책(ACT) 모델을 학습시키고, 로봇이 스스로 판단하여 Task를 수행하는 자율 시스템을 완성합니다.",
      items: [
        { title: "ACT Policy Training", desc: "수집된 데이터셋 기반 모델 학습" },
        { title: "Autonomous Inference", desc: "학습된 모델의 실시간 추론 및 제어" },
        { title: "Final Project", desc: "나만의 Task 수행 로봇 완성 및 발표" }
      ],
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
      gradient: "from-[#7B61FF] to-[#00AFFF]",
      borderColor: "border-[#7B61FF]",
      isProject: true
    }
  ];

  const curriculumOverview = [
    {
      week: "1주차",
      title: "Environment Setup",
      description: "Ubuntu, Conda, LeRobot 설치 및 환경 설정, Physical AI 기초 개념",
      borderColor: "border-l-[#00AFFF]"
    },
    {
      week: "2주차",
      title: "Teleoperation",
      description: "모터 ID 설정, Calibration, 리더-팔로워 로봇 제어 실습",
      borderColor: "border-l-[#00AFFF]"
    },
    {
      week: "3주차",
      title: "Data Pipeline",
      description: "다각도 카메라 연동, 데이터셋 녹화(Record), W&B 연동",
      borderColor: "border-l-[#00AFFF]"
    },
    {
      week: "4주차 (PRO)",
      title: "Final Project",
      description: "ACT 정책 학습, 자율 구동 추론(Inference), 프로젝트 완성",
      borderColor: "border-l-[#7B61FF]",
      isProject: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LeRobot AI Arm Master Class - 틴틴AI로봇아카데미</title>
        <meta name="description" content="Physical AI: 0 to 1. 시뮬레이션을 넘어선 실제 제어의 세계. LeRobot과 SO-ARM으로 나만의 로봇을 학습시키세요." />
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <Link to="/?section=curriculum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            커리큘럼으로 돌아가기
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              틴틴AI로봇아카데미 AI Course
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              LeRobot <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">AI Arm Master Class</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary font-medium mb-4">Physical AI: 0 to 1</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              시뮬레이션을 넘어선 실제 제어의 세계.<br />
              LeRobot과 SO-ARM으로 나만의 로봇을 학습시키세요.
            </p>
          </div>

          {/* Why Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
              왜 틴틴AI로봇아카데미인가?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 ${feature.iconColor}`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Week Sections */}
          {curriculum.map((week, index) => (
            <section key={week.week} className="mb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? 'order-2 lg:order-1' : ''}>
                  <Badge className={`mb-4 ${week.isProject ? 'bg-accent/10 text-accent border-accent/20' : ''}`}>
                    {week.week}주차 {week.isProject && '[Project]'}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {week.title}
                    </span>
                    <br />
                    {week.subtitle}
                  </h2>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{week.description}</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    {week.detail}
                  </p>
                  <ul className="space-y-4">
                    {week.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full ${week.isProject ? 'bg-purple-100' : 'bg-blue-50'} flex items-center justify-center shrink-0 mt-0.5 ${week.isProject ? 'text-[#7B61FF]' : 'text-[#00AFFF]'}`}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-muted-foreground">
                          <strong>{item.title}:</strong> {item.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative group ${index % 2 === 1 ? 'order-1 lg:order-2' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-tr ${week.gradient} rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                    <img 
                      src={week.image} 
                      alt={week.title}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Curriculum Overview */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              커리큘럼 한눈에 보기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {curriculumOverview.map((item, index) => (
                <Card 
                  key={index} 
                  className={`${item.borderColor} ${item.isProject ? 'bg-gradient-to-r from-purple-50/50 to-background' : ''} hover:shadow-lg transition-all`}
                >
                  <CardHeader>
                    <Badge 
                      variant={item.isProject ? "default" : "outline"} 
                      className={`w-fit mb-2 ${item.isProject ? 'bg-accent/10 text-accent border-accent/20' : ''}`}
                    >
                      {item.week}
                    </Badge>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-16 bg-muted/30 rounded-[40px] border">
            <div className="max-w-3xl mx-auto px-6">
              <p className="text-xl text-primary font-semibold mb-4">Physical AI 전문가가 될 준비가 되셨나요?</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground leading-tight">
                미래의 로봇 공학자로의<br />
                여정을 시작하세요
              </h2>
              <PaymentButton
                amount={99000}
                orderName="LeRobot AI Arm Master Class"
                curriculumId="robot-2"
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all"
              >
                수강 신청하기 <ArrowRight className="ml-2" />
              </PaymentButton>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RobotArmMasterClass;

