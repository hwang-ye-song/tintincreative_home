import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FacultyCard } from "@/components/FacultyCard";

const facultyMembers = [
  {
    name: "박지훈 박사",
    title: "AI 프로그램 책임자",
    expertise: ["머신러닝", "딥러닝", "컴퓨터 비전"],
    bio: "AI 연구 및 교육 분야 15년 경력. 주요 기술 기업의 수석 과학자 역임.",
    email: "j.park@academy.ai"
  },
  {
    name: "마리아 가르시아 교수",
    title: "로봇공학 책임자",
    expertise: ["로봇공학", "임베디드 시스템", "제어 이론"],
    bio: "자율 시스템과 우주 탐사 전문 전직 NASA 로봇공학 엔지니어.",
    email: "m.garcia@academy.ai"
  },
  {
    name: "리사 웡 박사",
    title: "NLP 전문가",
    expertise: ["자연어 처리", "AI 윤리", "데이터 과학"],
    bio: "윤리적 AI 개발에 초점을 둔 자연어 처리 분야 연구 논문 발표.",
    email: "l.wong@academy.ai"
  },
  {
    name: "로버트 첸 교수",
    title: "컴퓨터 비전 전문가",
    expertise: ["컴퓨터 비전", "이미지 처리", "신경망"],
    bio: "컴퓨터 비전 및 실시간 이미지 처리 시스템 분야 20년 이상 경력의 업계 베테랑.",
    email: "r.chen@academy.ai"
  },
  {
    name: "아만다 존슨 박사",
    title: "AI 윤리 자문",
    expertise: ["AI 윤리", "정책", "사회적 영향"],
    bio: "교육 기관을 위한 AI 윤리 및 책임 있는 AI 개발 분야 선도적 전문가.",
    email: "a.johnson@academy.ai"
  },
  {
    name: "데이비드 김 교수",
    title: "임베디드 시스템 강사",
    expertise: ["IoT", "마이크로컨트롤러", "하드웨어 설계"],
    bio: "교육 목적의 로봇 하드웨어 및 임베디드 시스템 교육 전문.",
    email: "d.kim@academy.ai"
  }
];

const Faculty = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-heading text-5xl font-bold mb-4">교수진</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI, 로봇공학, 교육 분야의 깊은 전문성을 가진 세계적 수준의 강사진으로부터 배우세요
            </p>
          </div>

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facultyMembers.map((faculty, index) => (
              <div key={index} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                <FacultyCard
                  name={faculty.name}
                  title={faculty.title}
                  expertise={faculty.expertise}
                  bio={faculty.bio}
                  email={faculty.email}
                />
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-lg p-12 animate-fade-in hover-scale">
            <h2 className="font-heading text-3xl font-bold mb-4">우리 팀에 합류하고 싶으신가요?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              우리는 항상 열정적인 교육자와 업계 전문가들이 우리 교수진에 합류하기를 기다리고 있습니다
            </p>
            <a href="mailto:careers@academy.ai" className="text-primary hover:underline font-medium">
              채용 기회에 대해 문의하기
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Faculty;
