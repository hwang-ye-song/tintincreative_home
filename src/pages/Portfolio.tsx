import React from "react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCard } from "@/components/PortfolioCard";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectDetail } from "@/components/ProjectDetail";
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(p => p.category).filter(Boolean))
      ) as string[];
      setCategories(["전체", ...uniqueCategories]);
    }
  };

  const filteredProjects = selectedCategory === "전체"
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Header Section */}
      <div className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Student Showcase</span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              학생 프로젝트
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              우리 학생들이 만든 혁신적인 AI & 로봇 프로젝트를 탐색해보세요
            </p>
          </div>

          {/* Add Project Button */}
          {user && (
            <div className="flex justify-center mt-8 animate-fade-in">
              <Button 
                onClick={() => setIsFormOpen(true)} 
                size="lg"
                className="hover-scale shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
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
                onClick={() => setSelectedProject(project)}
                className="cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PortfolioCard
                  title={project.title}
                  student={project.profiles.name}
                  description={project.description}
                  category={project.category || "기타"}
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

      {/* Dialogs */}
      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchProjects}
      />
      
      <ProjectDetail
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </div>
  );
};

export default Portfolio;
