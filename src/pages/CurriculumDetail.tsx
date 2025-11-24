import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowLeft, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Curriculum } from "@/types";
import { Helmet } from "react-helmet-async";

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
  const { id } = useParams<{ id: string }>();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { id: curriculumId } = useParams<{ id: string }>();

  const { data: curriculum, isLoading, error } = useQuery({
    queryKey: ["curriculum", curriculumId],
    queryFn: () => fetchCurriculum(curriculumId || ""),
    enabled: !!curriculumId,
  });

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
      </Helmet>
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors animate-fade-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="animate-fade-in">
                <Badge className="mb-4">{curriculum.level}</Badge>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{curriculum.title}</h1>
                <p className="text-xl md:text-2xl text-primary font-medium mb-4">{curriculum.subtitle}</p>
                <p className="text-base md:text-lg text-muted-foreground">{curriculum.description}</p>
              </div>

              {/* Three-Stage Roadmap */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">3단계 로드맵</h2>
                <div className="space-y-6">
                  {curriculum.tracks.map((track, index) => (
                    <Card key={index} className="border-l-4 border-l-primary hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="font-heading text-lg md:text-xl mb-2">
                              {track.name}
                            </CardTitle>
                            <CardDescription className="text-sm md:text-base">
                              {track.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {track.duration}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {track.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{topic}</span>
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
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">프로젝트 갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {curriculum.mediaAssets.map((asset, index) => (
                    <Card key={index} className="overflow-hidden hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      {asset.src ? (
                        <img src={asset.src} alt={asset.title} className="aspect-square object-cover w-full" />
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                          {asset.emoji}
                        </div>
                      )}
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-center">{asset.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24 animate-fade-in hover-scale" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="font-heading">코스 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">기간</p>
                      <p className="font-medium">{curriculum.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">수강생</p>
                      <p className="font-medium">{curriculum.students}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 hover-scale" size="lg">
                    지금 등록하기
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
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
