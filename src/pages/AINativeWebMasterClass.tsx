import React, { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/PaymentButton";

const AINativeWebMasterClass = () => {
  useEffect(() => {
    // 페이지 로드 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>AI 네이티브 웹 마스터 클래스 - Realize Academy</title>
        <meta name="description" content="AI 네이티브 웹 마스터 클래스: 0 to 1" />
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <Link to="/?section=curriculum" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors animate-fade-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            커리큘럼으로 돌아가기
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4">Realize Academy</Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI 네이티브 웹 마스터 클래스
            </h1>
            <p className="text-xl md:text-2xl text-primary font-medium mb-4">0 to 1</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              개발의 미래, 지금 시작됩니다.
            </p>
          </div>

          {/* Why Section */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-center">
              왜 Realize Academy인가?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <CardTitle>Figma 없는 디자인</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    디자인 툴에 시간을 낭비하지 마세요. PRD 문맥(Context)만 있으면 Lovable로 전문가급 UI를 즉시 생성합니다.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <CardTitle>MCP & 에이전트 엔지니어링</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    단순한 채팅이 아닙니다. MCP(Model Context Protocol)를 마스터하여 Cursor를 시니어 개발자로 채용하세요.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CardTitle>실전 수익화</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    장난감 프로젝트를 넘어, 실제 PG 결제가 연동된 쇼핑몰을 구축합니다.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Week 1 */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">1주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Context 엔지니어링
                </h2>
                <h3 className="text-xl font-semibold mb-4">기획(PRD) & 프로토타이핑</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  AI는 문맥을 먹고 자랍니다. 완벽한 설계도(PRD)를 작성하여 생성형 UI를 제어하는 법을 배웁니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>AI 주도 기획:</strong> Gemini를 활용한 아이디어 도출 및 PRD 생성</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>생성형 UI:</strong> Lovable을 통해 텍스트 프롬프트를 실제 인터페이스로 변환</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>내보내기:</strong> GitHub 연동 및 프로젝트 구조화</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="http://googleusercontent.com/image_collection/image_retrieval/2397849696168222048" 
                    alt="3D 아이소메트릭 웹 디자인 인터페이스 일러스트레이션"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Week 2 */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="http://googleusercontent.com/image_collection/image_retrieval/16121020010157144351" 
                    alt="빛나는 파란색 AI 비서가 있는 미래지향적 코드 편집기 인터페이스"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4">2주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI 엔지니어링
                </h2>
                <h3 className="text-xl font-semibold mb-4">MCP & 데이터 로직</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  사용자에서 AI 아키텍트로 거듭납니다. Cursor의 고급 문맥 기능을 활용해 복잡한 로직을 구현합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>시스템 프롬프팅:</strong> <code className="bg-muted px-2 py-1 rounded text-sm">.cursorrules</code>로 AI 페르소나 정의</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>API 연동:</strong> 외부 데이터(Fake Store API) 가져오기</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>상태 관리:</strong> 장바구니 로직을 위한 React Hooks 마스터</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Week 3 */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">3주차</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  배포 & 완성도
                </h2>
                <h3 className="text-xl font-semibold mb-4">세상을 향한 런칭</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  프로와 아마추어의 차이는 디테일에 있습니다. UX 디테일과 클라우드 배포에 집중합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>마이크로 인터랙션:</strong> 몰입감을 주는 로딩 및 버튼 효과</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>시뮬레이션:</strong> 결제 프로세스 완벽 시뮬레이션</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>CI/CD:</strong> Vercel을 통한 원클릭 글로벌 배포</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="http://googleusercontent.com/image_collection/image_retrieval/2006186612110507209" 
                    alt="미니멀리스트 3D 로켓 발사 일러스트레이션"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Week 4 Pro */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="http://googleusercontent.com/image_collection/image_retrieval/2196777984045648996" 
                    alt="3D 떠있는 신용카드와 보안 방패 아이콘"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">4주차 [Pro]</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  실전 결제 연동
                </h2>
                <h3 className="text-xl font-semibold mb-4">실제 수익 창출</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  궁극의 스킬: 공식 문서를 활용한 RAG 기반 코딩으로 복잡한 금융 시스템을 구현합니다.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>RAG 코딩:</strong> <code className="bg-muted px-2 py-1 rounded text-sm">@Docs</code>로 AI에게 최신 결제 API 학습</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>보안:</strong> <code className="bg-muted px-2 py-1 rounded text-sm">.env</code> 변수와 API 키의 안전한 관리</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground"><strong>실거래:</strong> 토스 페이먼츠를 통한 실제 카드 결제</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Curriculum Overview */}
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12 text-center">
              커리큘럼 한눈에 보기
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">1주차</Badge>
                  <CardTitle>Context 엔지니어링</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    PRD 기획, 생성형 UI(Lovable), 프로젝트 구조화
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">2주차</Badge>
                  <CardTitle>AI 엔지니어링</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    MCP(.cursorrules), API 데이터 연동, 비즈니스 로직
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">3주차</Badge>
                  <CardTitle>배포 & 완성도</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    UX/UI 고도화, 배포(Vercel), 라이브 쇼케이스
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 bg-purple-100 text-purple-700 border-purple-200">4주차 (PRO)</Badge>
                  <CardTitle>실전 결제 연동</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    RAG 코딩(@Docs), 보안 설정, 실시간 수익 시스템
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p className="text-xl text-muted-foreground mb-4">성장할 준비가 되셨나요?</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI 네이티브 개발자로의<br />여정을 시작하세요
            </h2>
            <PaymentButton
              amount={99000}
              orderName="AI 네이티브 웹 마스터 클래스"
              curriculumId="application-2"
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

export default AINativeWebMasterClass;
