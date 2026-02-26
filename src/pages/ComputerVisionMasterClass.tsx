import React, { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, ScanFace, Crosshair, Image, Video, CheckCircle, PlayCircle, Eye, Sparkles, BrainCircuit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const ComputerVisionMasterClass = () => {
  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goals = [
    {
      icon: <Image className="w-6 h-6" />,
      title: "AI 이미지 & 영상 생성",
      description: "AI 이미지 생성과 영상 생성의 원리를 체험하고 나만의 쇼핑몰 광고 콘텐츠를 제작합니다.",
      bgColor: "bg-blue-50",
      iconColor: "text-[#00AFFF]"
    },
    {
      icon: <ScanFace className="w-6 h-6" />,
      title: "이미지 분류의 원리",
      description: "Teachable Machine으로 AI 이미지 분류의 기본 원리(데이터 수집 → 학습 → 추론)를 이해합니다.",
      bgColor: "bg-purple-50",
      iconColor: "text-[#7B61FF]"
    },
    {
      icon: <Crosshair className="w-6 h-6" />,
      title: "객체 탐지 & 포즈 인식",
      description: "AI 툴을 활용하여 객체 탐지, 포즈 인식, 얼굴 랜드마크 인식의 개념을 익힙니다.",
      bgColor: "bg-blue-50",
      iconColor: "text-[#00AFFF]"
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "바이브코딩 웹 앱 제작",
      description: "AI 코딩 도구(Cursor)를 활용한 바이브코딩으로 본인만의 컴퓨터 비전 웹 앱을 제작합니다.",
      bgColor: "bg-purple-50",
      iconColor: "text-[#7B61FF]"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "쇼핑몰 광고 영상 + AI 체험관 포트폴리오",
      description: "최종적으로 쇼핑몰 광고 영상과 AI 체험관 웹사이트를 완성하여 포트폴리오로 활용합니다.",
      bgColor: "bg-gradient-to-br from-[#00AFFF] to-[#7B61FF]",
      iconColor: "text-white",
      colSpan: "lg:col-span-2"
    }
  ];

  const curriculum = [
    {
      week: 1,
      title: "쇼핑몰 캐릭터 + 광고 영상 만들기",
      tool: "AI 이미지/영상 생성",
      toolIcon: <Image className="w-3 h-3" />,
      items: [
        "생성 AI 개념 소개 (인식 AI vs 생성 AI)",
        "나의 쇼핑몰 분석 및 캐릭터 컨셉 기획 · AI 이미지 생성으로 마스코트 제작",
        "광고 영상 시나리오 작성 및 AI 영상 생성 (Image-to-Video)"
      ],
      project: "나의 쇼핑몰 캐릭터 + 광고 영상 완성",
      projectImages: ["/images/vision_character.png"],
      borderColor: "border-[#00AFFF]",
      bgColor: "bg-blue-50",
      textColor: "text-[#00AFFF]"
    },
    {
      week: 2,
      title: "이미지 분류 AI 만들기",
      tool: "Teachable Machine + Cursor",
      toolIcon: <ScanFace className="w-3 h-3" />,
      items: [
        "컴퓨터 비전 개념 소개 (분류 vs 탐지 vs 생성)",
        "웹캠으로 가위/바위/보 이미지 데이터 수집 및 모델 학습",
        "Cursor로 가위바위보 게임 웹앱 제작"
      ],
      project: "AI 가위바위보 게임 완성",
      projectImages: ["/images/vision_classification.png"],
      borderColor: "border-[#3D87FF]",
      bgColor: "bg-indigo-50",
      textColor: "text-[#3D87FF]"
    },
    {
      week: 3,
      title: "객체 탐지 + 포즈 인식 AI 만들기",
      tool: "Roboflow + MediaPipe + Cursor",
      toolIcon: <Crosshair className="w-3 h-3" />,
      items: [
        "이미지 분류 vs 객체 탐지 vs 포즈 인식 차이점 이해",
        "Roboflow로 이미지 라벨링 및 객체 탐지 모델 학습",
        "MediaPipe Pose로 포즈 인식 게임 제작 및 탭으로 통합"
      ],
      project: "물건 이동 게임 + 포즈 챌린지 완성",
      projectImages: ["/images/vision_detection1.png", "/images/vision_detection2.png"],
      borderColor: "border-[#7B61FF]",
      bgColor: "bg-purple-50",
      textColor: "text-[#7B61FF]"
    },
    {
      week: 4,
      title: "얼굴 인식 AI 만들기",
      tool: "MediaPipe Face Mesh + Cursor",
      toolIcon: <Shield className="w-3 h-3" />,
      items: [
        "Face Landmark 개념 이해 및 얼굴 인식 보안 시스템(FaceID) 원리 학습",
        "Cursor로 보안 게이트 + AR 필터 제작",
        "AI 체험관 메인 페이지 완성 및 최종 포트폴리오 정리"
      ],
      project: "얼굴 인식 보안 기능이 내장된 AI 체험관 완성",
      projectImages: ["/images/vision_face.png", "/images/vision_filter.png"],
      borderColor: "border-[#9D70FF]",
      bgColor: "bg-purple-50",
      textColor: "text-[#9D70FF]"
    }
  ];

  const outcomes = [
    { title: "2개의 포트폴리오 완성 (쇼핑몰 광고 영상 + AI 체험관)", number: 1 },
    { title: "컴퓨터 비전 전체 스펙트럼 이해: 생성과 인식의 원리와 차이점 학습", number: 2 },
    { title: "데이터의 중요성 체감: \"좋은 데이터 = 좋은 모델\" 원리 학습", number: 3 },
    { title: "생성 AI를 효과적으로 활용하기 위한 프롬프트 엔지니어링 역량 습득", number: 4 },
    { title: "AI 코딩 도구(Cursor)를 활용한 바이브코딩 경험", number: 5 },
    { title: "프로젝트명, 사용 도구, 구현 기능을 포함한 실전 포트폴리오 활용", number: 6 }
  ];

  const projects = [
    {
      title: "쇼핑몰 캐릭터 + 광고 영상",
      description: "AI로 생성한 마스코트와 쇼핑몰 광고 영상 콘텐츠",
      image: "/images/vision_character.png"
    },
    {
      title: "AI 가위바위보 게임",
      description: "Teachable Machine + Cursor로 만든 실시간 웹 게임",
      image: "/images/vision_classification.png"
    },
    {
      title: "AI 체험관 (미니게임 4종)",
      description: "물건이동, 포즈챌린지, 보안게이트, AR필터가 담긴 AI 체험관",
      image: "/images/vision_web.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>컴퓨터 비전 AI - 틴틴AI로봇아카데미</title>
        <meta name="description" content="AI 이미지·영상 생성으로 쇼핑몰 광고를 만들고, AI 툴과 Cursor로 나만의 AI 체험관을 완성하세요." />
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/?section=curriculum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors animate-fade-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            커리큘럼으로 돌아가기
          </Link>

          {/* Hero Section */}
          <section className="pt-8 pb-20 relative">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#00AFFF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-[#7B61FF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              {/* Text Content */}
              <div className="text-left">
                <Badge className="mb-6 px-4 py-1 text-sm bg-blue-50 text-[#00AFFF] border-blue-100">
                  🚀 4주 완성 프로젝트
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                  컴퓨터 비전 AI,<br />
                  <span className="bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] bg-clip-text text-transparent">
                    생성에서 인식까지
                  </span>
                  <br />
                  완벽하게 마스터.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                  AI 이미지·영상 생성으로 쇼핑몰 광고를 만들고, AI 툴과 Cursor로 나만의 AI 체험관을 완성하세요.
                  쇼핑몰 광고 영상부터 AI 미니게임까지, 생성과 인식을 모두 경험하는 4주 커리큘럼입니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="px-8 py-6 rounded-full bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] text-white font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                  >
                    커리큘럼 다운로드
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 rounded-full border-2 hover:border-[#00AFFF] hover:text-[#00AFFF] transition-all flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    강의 맛보기
                  </Button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] rounded-[2rem] opacity-30 blur-2xl animate-pulse"></div>
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background">
                  <img 
                    src="/images/vision_title.png" 
                    alt="AI Computer Vision Visualization" 
                    className="w-full h-auto object-cover transform transition-transform hover:scale-105 duration-700"
                  />
                  
                  {/* Floating Badge 1 */}
                  <div className="absolute top-8 left-8 bg-background/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-[#00AFFF]">
                      <ScanFace className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Face Detection</p>
                      <p className="text-sm font-bold text-foreground">98.5% Accuracy</p>
                    </div>
                  </div>

                  {/* Floating Badge 2 */}
                  <div className="absolute bottom-8 right-8 bg-background/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-[#7B61FF]">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">AI Video Gen</p>
                      <p className="text-sm font-bold text-foreground">Processing...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Course Goals */}
          <section className="py-16 bg-white relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">어떤 것을 배우나요?</h2>
              <p className="text-muted-foreground">이론보다는 실전! 최신 AI 도구를 활용해 직접 만들어봅니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {goals.map((goal, index) => (
                <Card 
                  key={index} 
                  className={`${goal.colSpan || ''} hover:shadow-lg transition-all duration-300 border-border hover:border-[#00AFFF]`}
                >
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl ${goal.bgColor} flex items-center justify-center mb-6 ${goal.iconColor}`}>
                      {goal.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{goal.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {goal.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Curriculum Timeline */}
          <section className="py-20 bg-muted/30">
            <div className="max-w-5xl mx-auto">
              <div className="mb-16 text-center">
                <Badge className="mb-2 px-4 py-1 text-sm bg-accent/10 text-accent border-accent/20">
                  Syllabus
                </Badge>
                <h2 className="text-3xl font-bold">주차별 상세 커리큘럼</h2>
              </div>

              <div className="relative space-y-12">
                {/* Timeline Line */}
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00AFFF] to-[#7B61FF] hidden md:block"></div>

                {curriculum.map((week, index) => (
                  <div key={week.week} className="relative pl-12 sm:pl-16 group">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full bg-background border-4 ${week.borderColor} z-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className="text-sm font-bold text-foreground">{week.week}</span>
                    </div>
                    <Card className="hover:shadow-lg transition-shadow border-border">
                      <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <h3 className="text-xl font-bold text-foreground">{week.title}</h3>
                          <Badge className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${week.bgColor} ${week.textColor} text-xs font-semibold mt-2 sm:mt-0 transition-all group-hover:bg-opacity-80 w-fit`}>
                            {week.toolIcon}
                            {week.tool}
                          </Badge>
                        </div>
                        <ul className="space-y-3 text-muted-foreground mb-6">
                          {week.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className={`w-4 h-4 ${week.textColor} mt-0.5 flex-shrink-0`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="bg-muted rounded-xl p-4 border border-border">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 bg-background rounded-lg shadow-sm ${week.textColor} group-hover:scale-110 transition-transform`}>
                              <Eye className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase">Project</p>
                              <p className="text-sm font-medium text-foreground">{week.project}</p>
                            </div>
                          </div>
                          {week.projectImages && (
                            <div className="flex justify-center gap-2 mt-2">
                              {week.projectImages.map((img: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${week.project} ${idx + 1}`}
                                  className="w-1/2 rounded-lg object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Project Showcase */}
          <section className="py-16 bg-white overflow-hidden">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">수강생 완성 예시</h2>
              <p className="text-muted-foreground">여러분의 아이디어가 현실이 됩니다.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {projects.map((project, index) => (
                <div key={index} className="w-full sm:w-80 group">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-video bg-muted mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] opacity-0 group-hover:opacity-20 transition-opacity z-10"></div>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-[#00AFFF] transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Outcomes / Call to Action */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] opacity-5"></div>
            <div className="max-w-4xl mx-auto relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-8">수강 후, 이렇게 달라집니다</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-12">
                {outcomes.map((outcome, index) => (
                  <Card key={index} className="border-blue-100">
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#00AFFF] flex items-center justify-center flex-shrink-0 font-bold">
                        {outcome.number}
                      </div>
                      <span className="font-medium text-foreground">{outcome.title}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="p-10 rounded-3xl text-center border-2 border-[#00AFFF]/20 bg-background/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4">지금 바로 시작하세요</h3>
                <p className="text-muted-foreground mb-8">미래를 준비하는 가장 확실한 방법, 틴틴AI로봇아카데미와 함께하세요.</p>
                <PaymentButton
                  amount={0}
                  orderName="컴퓨터 비전 AI 수강 신청"
                  curriculumId="application-2"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] text-white font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  수강 신청 바로가기
                </PaymentButton>
              </Card>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ComputerVisionMasterClass;

