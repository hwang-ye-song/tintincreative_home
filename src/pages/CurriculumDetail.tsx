import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowLeft, ArrowUp, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Curriculum } from "@/types";
import { Helmet } from "react-helmet-async";
import { PaymentButton } from "@/components/PaymentButton";

const fetchCurriculum = async (id: string): Promise<Curriculum | null> => {
  const { data, error } = await supabase
    .from("curriculums")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // Fallback to JSON if DB doesn't have the data
    try {
      const response = await fetch("/data/curriculums.json");
      if (response.ok) {
        const jsonData = await response.json();
        return jsonData[id] || null;
      }
    } catch {
      // Ignore fallback error
    }
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    level: data.level,
    duration: data.duration,
    students: data.students,
    price: data.price,
    tracks: data.tracks as Curriculum["tracks"],
    mediaAssets: data.media_assets as Curriculum["mediaAssets"],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const CurriculumDetail = () => {
  const { id: curriculumId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // robot ID는 별도 페이지로 리다이렉트
    if (curriculumId === "robot") {
      navigate("/curriculum/robot", { replace: true });
      return;
    }
    // application-4 ID는 챗봇 마스터 클래스 페이지로 리다이렉트
    if (curriculumId === "application-4") {
      navigate("/curriculum/application-4", { replace: true });
      return;
    }
    // basic-2 ID는 AI 프로그래밍 입문 페이지로 리다이렉트
    if (curriculumId === "basic-2") {
      navigate("/curriculum/basic-2", { replace: true });
      return;
    }
    // basic ID는 AICE 마스터 클래스 페이지로 리다이렉트
    if (curriculumId === "basic") {
      navigate("/curriculum/basic", { replace: true });
      return;
    }

    const loadCurriculum = async () => {
      if (!curriculumId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCurriculum(curriculumId);
        setCurriculum(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurriculum();
  }, [curriculumId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">커리큘럼을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">커리큘럼을 불러오는데 실패했습니다</h1>
          <p className="text-muted-foreground mb-4">다시 시도해주세요</p>
          <Link to="/">
            <Button>홈으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Curriculum not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{curriculum.title} - 커리큘럼 상세</title>
        <meta name="description" content={curriculum.description} />
        <meta property="og:title" content={curriculum.title} />
        <meta property="og:description" content={curriculum.description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${window.location.origin}/images/og_image_one.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${window.location.origin}/images/og_image_one.png`} />
      </Helmet>
      <Navbar />
      
      <div className="pt-20 pb-8 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors animate-fade-in text-xs">
            <ArrowLeft className="mr-1.5 h-3 w-3" />
            홈으로 돌아가기
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="animate-fade-in">
                <Badge className="mb-2 text-[10px]">{curriculum.level}</Badge>
                <h1 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold mb-2">{curriculum.title}</h1>
                <p className="text-sm md:text-base text-primary font-medium mb-2">{curriculum.subtitle}</p>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">{curriculum.description}</p>
              </div>

              {/* Three-Stage Roadmap */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-heading text-base md:text-lg font-bold mb-3">3단계 로드맵</h2>
                <div className="space-y-2">
                  {curriculum.tracks.map((track, index) => (
                    <Card key={index} className="border-l-4 border-l-primary hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="font-heading text-sm md:text-base mb-1">
                              {track.name}
                            </CardTitle>
                            <CardDescription className="text-[10px] md:text-xs">
                              {track.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {track.duration}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {track.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-start gap-1.5">
                              <div className="w-0.5 h-0.5 rounded-full bg-accent mt-1.5 shrink-0"></div>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Media Gallery */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-heading text-base md:text-lg font-bold mb-3">프로젝트 갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {curriculum.mediaAssets.map((asset, index) => (
                    <Card key={index} className="overflow-hidden hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      {asset.src ? (
                        <img 
                          src={asset.src} 
                          alt={asset.title} 
                          className="aspect-square object-cover w-full" 
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl">
                          {asset.emoji}
                        </div>
                      )}
                      <CardContent className="p-1.5">
                        <p className="text-[10px] font-medium text-center">{asset.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-20 animate-fade-in hover-scale" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm">코스 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">기간</p>
                      <p className="font-semibold text-sm">{curriculum.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">수강생</p>
                      <p className="font-semibold text-sm">{curriculum.students}</p>
                    </div>
                  </div>
                  {curriculum.price && curriculum.price > 0 ? (
                    <>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">가격</p>
                          <p className="font-bold text-lg text-primary">
                            {curriculum.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      <PaymentButton
                        amount={curriculum.price}
                        orderName={curriculum.title}
                        curriculumId={curriculum.id}
                        className="w-full mt-3 hover-scale"
                        size="md"
                      >
                        지금 등록하기
                      </PaymentButton>
                    </>
                  ) : (
                    <Button className="w-full mt-3 hover-scale" size="md" disabled>
                      무료 강의 (준비 중)
                    </Button>
                  )}
                  <p className="text-[10px] text-center text-muted-foreground">
                    14일 환불 보장
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-40"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <Footer />
    </div>
  );
};

export default CurriculumDetail;
