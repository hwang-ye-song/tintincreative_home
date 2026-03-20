import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUp, Presentation, Video, FileSpreadsheet, Globe, Sparkles } from "lucide-react";

const CanvaMasterClass = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coreThemes = [
    {
      title: "PPT 제작",
      description: "AI 비서 Gemini와 매직 디자인을 활용해 단시간에 프로 수준의 프레젠테이션을 완성합니다.",
      icon: <Presentation className="w-8 h-8" />,
      color: "blue"
    },
    {
      title: "동영상 제작",
      description: "스피드 페인터와 숏폼 템플릿으로 누구나 쉽게 눈길을 사로잡는 영상을 만듭니다.",
      icon: <Video className="w-8 h-8" />,
      color: "purple"
    },
    {
      title: "엑셀",
      description: "캔바 시트와 AI 빈셀 채우기로 스마트하고 안전하게 데이터를 관리하는 법을 배웁니다.",
      icon: <FileSpreadsheet className="w-8 h-8" />,
      color: "green"
    },
    {
      title: "웹사이트 만들기",
      description: "코딩 없이 드래그 앤 드롭과 AI로 나만의 포트폴리오 웹사이트를 배포합니다.",
      icon: <Globe className="w-8 h-8" />,
      color: "orange"
    }
  ];

  const curriculum = [
    {
      week: "1주차",
      title: "AI 비서 Gemini와 매직 디자인으로 첫 자기소개 완성",
      content: "똑똑한 AI 비서 Gemini에게 나를 소개하는 글을 요청하고, 캔바의 '매직 디자인'으로 디자인 뼈대를 완성합니다. 애니메이션 필터를 더해 살아 움직이는 슬라이드를 만듭니다."
    },
    {
      week: "2주차",
      title: "AI 이미지 생성기로 고퀄리티 나만의 캐릭터 기획",
      content: "텍스트만으로 원하는 캐릭터의 모습과 스타일을 입력하여 완성도 높은 나만의 캐릭터를 생성합니다. 캐릭터에 어울리는 배경 요소를 추가해 프로필 도안을 완성합니다."
    },
    {
      week: "3주차",
      title: "스피드 페인터(Speed Painter)로 드로잉 애니메이션 자동 생성",
      content: "2주차에 만든 캐릭터 이미지를 불러와 '스피드 페인터'로 드로잉 애니메이션을 만듭니다. 실제로 그리는 듯한 멋진 물리적 효과를 영상으로 변환합니다."
    },
    {
      week: "4주차",
      title: "폰트 프레임 & 쇼피 크롭으로 트렌디한 타이틀 포스터 디자인",
      content: "'폰트 프레임'으로 글자 안에 사진을 넣는 감각적인 타이틀을 만들고, '쇼피 크롭'으로 테두리를 자유롭게 자른 콜라주 포스터를 완성합니다."
    },
    {
      week: "5주차",
      title: "5분 만에 완성하는 유튜브 숏폼(모바일 동영상) 제작",
      content: "동영상 템플릿과 앞서 만든 결과물들을 배치하고, '매직 단축키'를 활용해 생동감 넘치는 숏폼 영상을 빠르게 제작하여 다운로드합니다."
    },
    {
      week: "6주차",
      title: "캔바 시트(Canva Sheet)와 AI로 스마트한 데이터 관리",
      content: "엑셀 파일을 캔바 시트로 업로드하여 편집하고, AI의 '빈셀 채우기' 기능을 통해 데이터의 맥락을 파악하여 안전하게 데이터를 관리하는 실습을 합니다."
    },
    {
      week: "7주차",
      title: "AI 문서 편집기 캔바 독스(Docs) & 기존 PPT 시각화",
      content: "워드/PPT 파일을 캔바 독스로 변환하여 세련된 웹 문서처럼 편집합니다. 반응형 프레임을 활용해 기존 자료를 고퀄리티 시각 자료로 업그레이드합니다."
    },
    {
      week: "8주차",
      title: "내 작품을 전시할 AI 포트폴리오 웹사이트 디자인",
      content: "교육용 웹사이트 템플릿을 선택해 나만의 포트폴리오 구조를 잡고, 1~7주차 동안 만든 결과물들을 삽입하여 멋지게 꾸밉니다."
    },
    {
      week: "9주차",
      title: "웹사이트 하이퍼링크 설정 및 최종 배포",
      content: "페이지 제목과 하이퍼링크 탐색 메뉴를 설정하여 이동이 편리한 사이트를 만듭니다. 맞춤 URL 설정과 비밀번호 보호 기능을 켜서 안전하게 배포합니다."
    },
    {
      week: "10주차",
      title: "QR코드 생성 및 포트폴리오 최종 시사회",
      content: "배포된 웹사이트 주소를 QR코드로 변환하여 스마트폰으로 바로 접속할 수 있게 합니다. 서로의 포트폴리오를 감상하며 10주간의 창작 수업을 마무리합니다."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Realize Academy - 캔바 AI 활용 마스터 클래스</title>
        <meta name="description" content="캔바 AI와 함께하는 10주간의 스마트 창작 여행. PPT, 영상, 데이터, 웹사이트까지 한 번에 마스터하세요." />
      </Helmet>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #ffffff;
          color: #1e293b;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .section { padding: 80px 0; }
        
        #hero {
          padding-top: 150px;
          padding-bottom: 80px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .hero-tag {
          background: #00AFFF;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          color: #0f172a;
          margin-bottom: 24px;
        }
        .hero-desc {
          font-size: 20px;
          color: #475569;
          margin-bottom: 32px;
        }
        .hero-image {
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 32px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 12px;
          color: #0f172a;
        }
        .section-subtitle {
          font-size: 18px;
          text-align: center;
          color: #64748b;
          margin-bottom: 48px;
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }
        .theme-card {
           background: white;
           padding: 32px;
           border-radius: 20px;
           border: 1px solid #e2e8f0;
           transition: all 0.3s ease;
        }
        .theme-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
          border-color: #00AFFF;
        }
        .theme-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .icon-blue { background: #e0f2fe; color: #00AFFF; }
        .icon-purple { background: #f3e8ff; color: #7B61FF; }
        .icon-green { background: #ecfdf5; color: #10b981; }
        .icon-orange { background: #ffedd5; color: #f97316; }

        .roadmap-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        .week-item {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 24px;
          align-items: center;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .week-item:hover {
          background: white;
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .week-badge {
          background: #0f172a;
          color: white;
          padding: 8px;
          border-radius: 12px;
          text-align: center;
          font-weight: 700;
          font-size: 14px;
        }
        .week-content h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1e293b;
        }
        .week-content p {
          font-size: 15px;
          color: #64748b;
        }

        .cta-box {
          background: linear-gradient(135deg, #00AFFF 0%, #0077cc 100%);
          border-radius: 30px;
          padding: 60px;
          text-align: center;
          color: white;
          margin-top: 60px;
        }
        .cta-title { font-size: 32px; font-weight: 800; margin-bottom: 16px; }
        .cta-desc { font-size: 18px; margin-bottom: 32px; opacity: 0.9; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr; text-align: center; }
          .hero-title { font-size: 36px; }
          .week-item { grid-template-columns: 1fr; text-align: center; gap: 12px; }
          .week-badge { width: 80px; margin: 0 auto; }
        }
      `}</style>

      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section id="hero">
          <div className="container">
            <div className="hero-grid">
              <div className="animate-fade-in">
                <div className="hero-tag"><Sparkles className="inline-block w-4 h-4 mr-1 pb-1" /> 10주 집중 마스터</div>
                <h1 className="hero-title">캔바 AI로 완성하는 <br /><span className="text-[#00AFFF]">스마트 창작</span> 마스터 클래스</h1>
                <p className="hero-desc">복잡한 디자인 툴 대신 AI와 함께하세요. 누구나 프로가 되는 캔바 AI 활용 실무 과정을 소개합니다.</p>
                <div className="flex gap-4">
                  <Button size="lg" className="bg-[#00AFFF] hover:bg-[#008ecc] text-white">상담 신청하기</Button>
                  <Button size="lg" variant="outline">커리큘럼 다운로드</Button>
                </div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <img src="/images/canva-ai-hero.png" alt="Canva AI Master Class" className="hero-image" />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Themes Section */}
        <section className="section bg-white">
          <div className="container">
            <h2 className="section-title">4대 핵심 마스터 주제</h2>
            <p className="section-subtitle">디자인부터 데이터 분석까지, 캔바 하나로 끝냅니다.</p>
            <div className="theme-grid">
              {coreThemes.map((theme, i) => (
                <div key={i} className="theme-card">
                  <div className={`theme-icon icon-${theme.color}`}>
                    {theme.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{theme.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="section bg-[#f8fafc]/50">
          <div className="container">
            <h2 className="section-title">10주차 상세 로드맵</h2>
            <p className="section-subtitle">매주 하나씩 완성해 나가는 나만의 AI 포트폴리오</p>
            
            <div className="roadmap-container">
              {curriculum.map((item, index) => (
                <div key={index} className="week-item">
                  <div className="week-badge">{item.week}</div>
                  <div className="week-content">
                    <h4>{item.title}</h4>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Box */}
            <div className="cta-box animate-fade-in">
              <h2 className="cta-title">지금 바로 AI와 함께 시작하세요!</h2>
              <p className="cta-desc">10주 만에 완성하는 나만의 고퀄리티 포트폴리오, 캔바 AI 마스터 클래스와 함께라면 가능합니다.</p>
              <Button size="lg" className="bg-white text-[#00AFFF] hover:bg-gray-100 font-bold px-10">
                무료 수업 신청하기
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-50 bg-[#00AFFF] hover:bg-[#008ecc]"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <Footer />
    </>
  );
};

export default CanvaMasterClass;
