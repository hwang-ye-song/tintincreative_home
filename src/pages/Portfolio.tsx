import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Sparkles } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tags: string[] | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
  };
}

const Portfolio = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const categories = ["전체", "AI 기초", "AI 활용", "로봇"];
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles (name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
  };

  const filteredProjects = selectedCategory === "전체"
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Header Section */}
      <div className="relative pt-24 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Student Showcase</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              학생 프로젝트
            </h1>
          </div>

          {/* Add Project Button */}
          {user && (
            <div className="flex justify-center mt-4 animate-fade-in">
              <Button 
                onClick={() => navigate("/portfolio/create")} 
                size="sm"
                className="hover-scale shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 등록
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 px-4">
        <div className="container mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="hover-scale transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/portfolio/${project.id}`)}
                className="cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PortfolioCard
                  title={project.title}
                  student={project.profiles.name}
                  description={project.description}
                  category={project.category || "기타"}
                  tags={project.tags || []}
                  image={project.image_url || "📁"}
                />
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg text-muted-foreground">
                이 카테고리에 프로젝트가 없습니다
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolio;
