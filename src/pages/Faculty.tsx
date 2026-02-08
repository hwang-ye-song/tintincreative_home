import React, { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FacultyCard } from "@/components/FacultyCard";

const facultyMembers = [
  {
    name: "강경호",
    title: "AI 프로그램 책임자",
    expertise: ["머신러닝", "딥러닝", "컴퓨터 비전"],
    bio: "전 삼성전자 책임연구원",
    email: ""
  },
  {
    name: "강다정",
    title: "배터리 강사",
    expertise: ["배터리", "에너지 저장", "전기화학"],
    bio: "과학고 졸업, UNIST",
    email: ""
  },
  {
    name: "신옥철",
    title: "AI 융합 논술 교수",
    expertise: ["AI 융합 논술", "AI로 책 만들기"],
    bio: "(전) 경기대 교수",
    email: ""
  },
  {
    name: "황예성",
    title: "웹 개발 전문가",
    expertise: ["바이브 코딩", "홈페이지 제작", "풀스택 개발"],
    bio: "프론트엔드 및 백엔드 웹 개발 전문가",
    email: ""
  },
  {
    name: "방동하",
    title: "로봇공학 책임자",
    expertise: ["로봇공학", "임베디드 시스템", "제어 이론"],
    bio: "",
    email: ""
  },
  {
    name: "서현우",
    title: "임베디드 시스템 강사",
    expertise: ["IoT", "마이크로컨트롤러", "하드웨어 설계"],
    bio: "",
    email: ""
  },
  {
    name: "김현준",
    title: "컴퓨터 비전 전문가",
    expertise: ["컴퓨터 비전", "이미지 처리", "신경망"],
    bio: "",
    email: ""
  }
];

const Faculty = () => {
  // 페이지 로드 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-heading text-5xl font-bold mb-4">강사진</h1>
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
              우리는 항상 열정적인 교육자와 업계 전문가들이 우리 강사진에 합류하기를 기다리고 있습니다
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
