import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Workflow, Database, CheckCircle, AlertTriangle, ArrowRight, Sparkles, Layers, BrainCircuit, Shield, Bot, ShoppingCart, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

/* --- Hero Composite Component --- */
const HeroComposite = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] perspective-1000">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-[80px]" />

      {/* 1. Main Screen: Shopping Mall Chatbot (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[70%] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-20 animate-float-slow">
        {/* Browser Header */}
        <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center text-xs text-muted-foreground font-medium bg-background mx-4 py-1 rounded-md shadow-sm">
            my-ai-shop.com
          </div>
        </div>
        {/* Chat UI Content */}
        <div className="p-6 bg-muted/50 min-h-[300px] flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-background p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-muted-foreground border border-border max-w-[80%]">
              안녕하세요! 고객님, 찾으시는 스타일이 있으신가요? 🤖
            </div>
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              <span className="text-xs font-bold">Me</span>
            </div>
            <div className="bg-primary p-3 rounded-2xl rounded-tr-none shadow-md text-sm text-white max-w-[80%]">
              20대 대학생이 입기 좋은 편한 후드티 추천해줘!
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0">
              <Bot size={16} />
            </div>
            <div className="space-y-2 max-w-[80%]">
              <div className="bg-background p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-muted-foreground border border-border">
                인기 상품 3가지를 찾았습니다! 🛍️
              </div>
              {/* Product Card Mini */}
              <div className="bg-background p-2 rounded-xl border border-border flex gap-3 shadow-sm">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <ShoppingCart size={16} />
                </div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-muted rounded mb-1" />
                  <div className="h-2 w-10 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Left Floating Card: n8n Automation (Week 3) */}
      <div className="absolute top-[20%] left-[0%] md:-left-[5%] w-[180px] bg-background/90 backdrop-blur-md rounded-xl shadow-xl border border-border p-4 z-30 animate-float-medium hidden md:block">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <Workflow size={14} />
          </div>
          <span className="text-xs font-bold text-foreground">n8n Automation</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-1.5 rounded border border-border">
            <Mail size={10} className="text-red-400" /> New Email
          </div>
          <div className="h-2 w-0.5 bg-border mx-auto" />
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-1.5 rounded border border-border">
            <BrainCircuit size={10} className="text-primary" /> AI Processing
          </div>
          <div className="h-2 w-0.5 bg-border mx-auto" />
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-1.5 rounded border border-border">
            <Calendar size={10} className="text-blue-500" /> Add Event
          </div>
        </div>
      </div>

      {/* 3. Right Floating Card: Commerce Data (Week 2) */}
      <div className="absolute bottom-[20%] right-[0%] md:-right-[5%] w-[160px] bg-background/90 backdrop-blur-md rounded-xl shadow-xl border border-border p-4 z-30 animate-float-fast hidden md:block">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <Database size={14} />
          </div>
          <span className="text-xs font-bold text-foreground">Store Data</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="w-2 h-6 bg-muted rounded-t" />
            <div className="w-2 h-10 bg-muted rounded-t" />
            <div className="w-2 h-8 bg-accent rounded-t" />
            <div className="w-2 h-12 bg-muted rounded-t" />
            <div className="w-2 h-5 bg-muted rounded-t" />
          </div>
          <div className="pt-2 border-t border-border flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>Sales</span>
            <span className="text-accent">+24%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const ChatbotMasterClass = () => {
  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chatbot & AI Agent Master Class - 틴틴AI로봇아카데미</title>
        <meta name="description" content="Chatling & n8n: 0 to Automation. 노코드/로우코드로 실무 수준의 AI 자동화 파이프라인을 구축하세요." />
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/?section=curriculum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors animate-fade-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            커리큘럼으로 돌아가기
          </Link>

          {/* Hero Section */}
          <div className="flex flex-col items-center mb-24 animate-fade-in relative">
            <div className="text-center max-w-3xl mb-12">
              <Badge className="mb-6 px-4 py-1 text-sm">틴틴AI로봇아카데미 AI Course</Badge>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                Chatbot & AI Agent <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Master Class
                </span>
              </h1>
              <p className="text-2xl text-foreground font-bold mb-4">Chatling & n8n: 0 to Automation</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chatling으로 만드는 쇼핑몰 챗봇부터 n8n AI Agent까지.<br/>
                노코드/로우코드로 실무 수준의 AI 자동화 파이프라인을 구축하세요.
              </p>
            </div>

            {/* Hero Composite Visual */}
            <HeroComposite />
          </div>

          {/* Why Section */}
          <section id="why" className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">왜 이 강의인가?</h2>
              <p className="text-muted-foreground">단순한 대화를 넘어 행동하는 AI를 만듭니다.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <MessageSquare size={28} />
                  </div>
                  <CardTitle>No-Code Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Chatling 플랫폼을 활용해 코딩 없이도 Knowledge Base와 멀티 턴 대화가 가능한 상용 수준의 쇼핑몰 챗봇을 구현합니다.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                    <Workflow size={28} />
                  </div>
                  <CardTitle>n8n AI Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Docker 기반의 n8n 워크플로우를 구축하여 Google Calendar, Sheets, Gmail과 연동된 '행동하는' 개인 비서 에이전트를 만듭니다.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Database size={28} />
                  </div>
                  <CardTitle>Portfolios</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    과정 종료 시, '개인 쇼핑몰 웹 챗봇'과 '개인 비서 AI Agent'라는 두 가지의 완성된 포트폴리오를 확보합니다.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Week 1: Chatling Basics */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-4">1주차</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Chatbot Fundamentals
                </h2>
                <h3 className="text-xl font-semibold mb-6 text-primary">개인 쇼핑몰 웹 챗봇 기초</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  나만의 쇼핑몰에 AI 직원을 채용하세요. Chatling 플랫폼의 핵심 블록을 조립하여 기본 대화 모델을 완성합니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "Chatling 플랫폼 가입 및 기본 설정",
                    "Knowledge Base 설정 (Text/Document 학습)",
                    "Builder 블록 실습 (AI Response, Form, Buttons)",
                    "개인 쇼핑몰 웹사이트에 기본 챗봇 배포"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px]">
                <CourseVisual 
                  imageSrc="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
                  alt="Chatbot Builder Flowchart"
                  title="AI Chatbot Builder" 
                  sub="Week 1" 
                  icon={Bot}
                />
              </div>
            </div>
          </section>

          {/* Week 2: Advanced Chatling */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative h-[400px]">
                <CourseVisual
                  imageSrc="/images/ai_chatbot.avif"
                  alt="Ecommerce Analytics Dashboard"
                  title="Intelligent Commerce"
                  sub="Week 2"
                  icon={ShoppingCart}
                />
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4" variant="outline">2주차</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Intelligent Interaction
                </h2>
                <h3 className="text-xl font-semibold mb-6 text-accent">챗봇 완성도 높이기</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  단순 응답을 넘어선 지능적 대화. 장바구니 담기, 감정 분석 등 심화 기능을 통해 실제 서비스 수준의 챗봇을 구현합니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "브랜드 맞춤형 Appearance 커스터마이징",
                    "심화 A: 멀티 턴 AI 대화 (단계별 상품 추천)",
                    "심화 B: 장바구니 시뮬레이션 및 요약",
                    "심화 C: 고객 감정 분석 또는 상품 비교 기능"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-accent" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Week 3: n8n AI Agent */}
          <section className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-4">3주차</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Automation with AI Agent
                </h2>
                <h3 className="text-xl font-semibold mb-6 text-primary">n8n AI Agent 제작</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  스스로 도구를 사용하는 AI. Docker와 n8n을 활용해 구글 캘린더, 시트, 이메일을 제어하는 나만의 비서를 만듭니다.
                </p>
                <ul className="space-y-4">
                  {[
                    "Docker 설치 및 n8n 로컬 셀프 호스팅",
                    "AI Agent vs 워크플로우 개념 학습",
                    "Google Cloud Console API 연동 (Calendar, Sheets, Gmail)",
                    "System Prompt 작성 및 개인 비서 테스트"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px]">
                <CourseVisual
                  imageSrc="/images/ai_agent.jpg"
                  alt="Complex Code and Data Logic"
                  title="n8n Workflow & Agents"
                  sub="Week 3"
                  icon={Workflow}
                />
              </div>
            </div>
          </section>

          {/* Caution & Requirements */}
          <section className="mb-32" id="requirements">
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
                      <span>본 교육은 <strong>중학생 수준</strong>에 맞춘 노코드/로우코드 과정이나, 논리적 사고력이 요구됩니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span><strong>개인 구글 계정</strong>이 필수이며, 프로젝트 파일 저장을 생활화해주세요.</span>
                    </li>
                  </ul>
                  <ul className="space-y-3 text-amber-900/80 dark:text-amber-200/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span>n8n 실습은 <strong>Docker 컨테이너</strong> 환경에서 진행되며, 수업 종료 시 Agent도 중지됩니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                      <span>효율적인 학습을 위해 강사의 안내에 따라 단계별로 진행해주세요.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Outcomes Grid */}
          <section id="outcomes" className="mb-32">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              수강 후 기대 효과
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "포트폴리오 2종 완성", desc: "쇼핑몰 챗봇(Chatling) & 개인 비서 AI Agent(n8n)", icon: <Sparkles className="w-5 h-5 text-primary" /> },
                { title: "노코드 개발 경험", desc: "코딩 없이 구현하는 실무 수준의 AI 시스템 구축 능력", icon: <Layers className="w-5 h-5 text-primary" /> },
                { title: "프롬프트 엔지니어링", desc: "AI를 효과적으로 제어하는 논리적 프롬프트 작성 역량", icon: <MessageSquare className="w-5 h-5 text-primary" /> },
                { title: "자동화 워크플로우", desc: "n8n을 활용한 업무 자동화 원리 이해 및 적용", icon: <Workflow className="w-5 h-5 text-primary" /> },
                { title: "AI Agent 이해", desc: "단순 챗봇을 넘어선 차세대 Agent 기술 원리 습득", icon: <BrainCircuit className="w-5 h-5 text-primary" /> },
                { title: "차별화된 스펙", desc: "고등학교 진학 및 이력서에 활용 가능한 실전 프로젝트 경험", icon: <Shield className="w-5 h-5 text-primary" /> }
              ].map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {item.icon}
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-20 bg-muted/30 rounded-[40px] border">
            <div className="max-w-3xl mx-auto px-6">
              <p className="text-xl text-primary font-semibold mb-4">Ready to Automate?</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground leading-tight">
                미래를 만드는 AI 기술,<br />
                틴틴AI로봇아카데미에서 시작하세요.
              </h2>
              <PaymentButton
                amount={99000}
                orderName="Chatbot & AI Agent Master Class"
                curriculumId="application-4"
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

export default ChatbotMasterClass;

