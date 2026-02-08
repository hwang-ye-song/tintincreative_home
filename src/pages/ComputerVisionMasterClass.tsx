import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ScanFace, Crosshair, Globe, Image, Video, CheckCircle, ArrowRight, PlayCircle, Eye, Sparkles, Layers, BrainCircuit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const ComputerVisionMasterClass = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goals = [
    {
      icon: <ScanFace className="w-6 h-6" />,
      title: "이미지 분류의 원리",
      description: "Teachable Machine을 사용하여 데이터 수집부터 학습, 추론까지의 AI 프로세스를 직접 경험하고 이해합니다.",
      bgColor: "bg-blue-50",
      iconColor: "text-[#00AFFF]"
    },
    {
      icon: <Crosshair className="w-6 h-6" />,
      title: "객체 탐지 (Object Detection)",
      description: "Roboflow를 활용해 바운딩 박스와 라벨링 개념을 익히고, 나만의 객체 탐지 모델을 학습시킵니다.",
      bgColor: "bg-purple-50",
      iconColor: "text-[#7B61FF]"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "웹 앱 제작 및 배포",
      description: "Gradio와 Hugging Face Spaces를 통해 내가 만든 AI 모델을 누구나 접속 가능한 웹 서비스로 배포합니다.",
      bgColor: "bg-blue-50",
      iconColor: "text-[#00AFFF]"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "생성형 AI 이미지",
      description: "Nano Banana(Gemini)를 활용하여 텍스트로 이미지를 생성하고 편집하는 원리를 체험하며 창의력을 키웁니다.",
      bgColor: "bg-purple-50",
      iconColor: "text-[#7B61FF]"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Veo 비디오 생성 & 통합 포트폴리오",
      description: "최신 도구 Veo를 사용해 텍스트와 이미지로 비디오를 제작하고, 인식과 생성을 아우르는 최종 포트폴리오를 완성합니다.",
      bgColor: "bg-gradient-to-br from-[#00AFFF] to-[#7B61FF]",
      iconColor: "text-white",
      colSpan: "lg:col-span-2"
    }
  ];

  const curriculum = [
    {
      week: 1,
      title: "이미지 분류 AI 만들기",
      tool: "Teachable Machine",
      toolIcon: <ScanFace className="w-3 h-3" />,
      items: [
        "컴퓨터 비전 개념 소개 (분류 vs 탐지 vs 생성)",
        "웹캠으로 클래스별 이미지 데이터 수집 및 학습",
        "웹 내보내기로 간단한 분류 웹 페이지 제작"
      ],
      project: "나만의 손동작 인식기 (가위바위보, 숫자 인식 등)",
      borderColor: "border-[#00AFFF]",
      bgColor: "bg-blue-50",
      textColor: "text-[#00AFFF]"
    },
    {
      week: 2,
      title: "객체 탐지 AI 만들기",
      tool: "Roboflow",
      toolIcon: <Crosshair className="w-3 h-3" />,
      items: [
        "이미지 업로드 및 바운딩 박스 라벨링 실습",
        "데이터 증강(Augmentation)과 AutoML 학습",
        "YOLOv8 모델 활용 실시간 탐지 테스트"
      ],
      project: "교실 물품 탐지기 (필통, 물병, 스마트폰 등)",
      borderColor: "border-[#3D87FF]",
      bgColor: "bg-indigo-50",
      textColor: "text-[#3D87FF]"
    },
    {
      week: 3,
      title: "AI 웹 앱 배포하기",
      tool: "Gradio + Hugging Face",
      toolIcon: <Globe className="w-3 h-3" />,
      items: [
        "Gradio 기본 문법 학습 (Python 최소 코드)",
        "1~2주차 모델 연동 및 파일 업로드 UI 제작",
        "Hugging Face Spaces 배포 및 포트폴리오 정리"
      ],
      project: "전 세계에 공유 가능한 나만의 CV 웹 앱",
      borderColor: "border-[#7B61FF]",
      bgColor: "bg-purple-50",
      textColor: "text-[#7B61FF]"
    },
    {
      week: 4,
      title: "AI 이미지 생성하기",
      tool: "Gemini (Nano Banana)",
      toolIcon: <Image className="w-3 h-3" />,
      items: [
        "Text-to-Image 및 효과적인 프롬프트 작성법",
        "이미지 편집(In-painting), 스타일 변환, 캐릭터 일관성 유지"
      ],
      project: "나만의 AI 캐릭터 & 4컷 스토리 제작",
      borderColor: "border-[#9D70FF]",
      bgColor: "bg-purple-50",
      textColor: "text-[#9D70FF]"
    },
    {
      week: 5,
      title: "AI 비디오 & 최종 포트폴리오",
      tool: "Veo (Google AI Studio)",
      toolIcon: <Video className="w-3 h-3" />,
      items: [
        "텍스트/이미지를 비디오로 변환 (Text/Image-to-Video)",
        "여러 클립 연결 및 스토리 영상 제작",
        "3개의 포트폴리오(분류, 탐지, 생성) 최종 정리"
      ],
      project: "30초 AI 생성 숏폼 콘텐츠 완성",
      borderColor: "border-[#B084FF]",
      bgColor: "bg-purple-50",
      textColor: "text-[#B084FF]"
    }
  ];

  const outcomes = [
    { title: "인식부터 생성까지 컴퓨터 비전의 전 과정 마스터", number: 1 },
    { title: "고입/대입에 활용 가능한 차별화된 포트폴리오 3종", number: 2 },
    { title: "생성 AI 프롬프트 엔지니어링 역량 확보", number: 3 },
    { title: "데이터 수집 및 AI 윤리 의식 함양", number: 4 }
  ];

  const projects = [
    {
      title: "가위바위보 판독기",
      description: "손동작을 인식하여 승패를 판별하는 웹 게임",
      image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "재활용 쓰레기 분류",
      description: "캔, 플라스틱, 유리를 자동으로 탐지하는 AI",
      image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "AI 숏폼 뮤직비디오",
      description: "Veo로 생성한 영상과 음악을 합친 나만의 콘텐츠",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>컴퓨터 비전 AI - 틴틴AI로봇아카데미</title>
        <meta name="description" content="이미지 분류부터 객체 탐지, 그리고 최신 생성형 AI 비디오 제작까지. 코딩 학원 강사가 직접 설계한 실전형 커리큘럼으로 나만의 AI 포트폴리오를 완성하세요." />
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
                  🚀 5주 완성 프로젝트
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                  컴퓨터 비전 AI,<br />
                  <span className="bg-gradient-to-r from-[#00AFFF] to-[#7B61FF] bg-clip-text text-transparent">
                    인식에서 생성까지
                  </span>
                  <br />
                  완벽하게 마스터.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                  이미지 분류부터 객체 탐지, 그리고 최신 생성형 AI 비디오 제작까지.
                  코딩 학원 강사가 직접 설계한 실전형 커리큘럼으로 나만의 AI 포트폴리오를 완성하세요.
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
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000" 
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
                        <div className="bg-muted rounded-xl p-4 border border-border flex items-start gap-3">
                          <div className={`p-2 bg-background rounded-lg shadow-sm ${week.textColor} group-hover:scale-110 transition-transform`}>
                            <Eye className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase">Project</p>
                            <p className="text-sm font-medium text-foreground">{week.project}</p>
                          </div>
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
                  amount={99000}
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

