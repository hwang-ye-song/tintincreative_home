import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Terminal, Radar, Map } from "lucide-react";

interface CurriculumCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: React.ReactNode;
  image?: string;
}

// Robotics Hero Composite for Curriculum Card (compact version)
const RoboticsHeroCompact = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1E1E1E] rounded-xl">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-[60px] -z-10" />
      
      {/* Main Screen: ROS Terminal & Simulation */}
      <div className="relative w-full h-full flex">
        {/* Left: Terminal */}
        <div className="w-1/2 p-2 font-mono text-[8px] text-green-400 border-r border-white/10 overflow-hidden bg-[#1E1E1E] flex flex-col justify-center">
          <p className="opacity-50">$ roslaunch omo_r1mini...</p>
          <p className="text-white mt-1">[INFO] OMO R1mini Connected.</p>
          <p className="text-blue-400 mt-1">$ roslaunch turtlebot3_slam...</p>
          <p className="text-white">[INFO] SLAM: Gmapping</p>
        </div>
        
        {/* Right: Simulation View */}
        <div className="w-1/2 bg-[#000] relative flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80" 
            alt="LiDAR Point Cloud Map"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Robot Icon */}
          <div className="relative z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center border border-white" style={{ boxShadow: '0 0 20px hsl(var(--primary))' }}>
            <Bot className="text-white" size={12} />
          </div>
          
          {/* UI Overlay */}
          <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[8px] text-green-400 font-mono border border-green-900">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            LiDAR
          </div>
        </div>
      </div>
      
      {/* Left Floating Card: LiDAR Data */}
      <div className="absolute top-[10%] left-[-5%] w-[60px] bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-1.5 z-40 transform -rotate-6">
        <div className="flex items-center gap-1 mb-1">
          <Radar size={8} className="text-red-400" />
          <span className="text-[7px] font-bold">LiDAR</span>
        </div>
        <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-full border border-green-500/30 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 border border-green-500/10 rounded-full scale-50" />
          <div className="w-0.5 h-0.5 bg-red-500 rounded-full" />
        </div>
      </div>
      
      {/* Right Floating Card: SLAM Map */}
      <div className="absolute bottom-[10%] right-[-5%] w-[60px] bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-1.5 z-40 transform rotate-6">
        <div className="flex items-center gap-1 mb-1">
          <Map size={8} className="text-accent" />
          <span className="text-[7px] font-bold">SLAM</span>
        </div>
        <div className="w-full bg-muted rounded h-8 p-1 relative overflow-hidden">
          <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 border border-border border-dashed rounded" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};

export const CurriculumCard = ({ id, title, description, level, duration, icon, image }: CurriculumCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all hover-scale h-[480px] flex flex-col w-full">
      <CardHeader className="space-y-1.5 pb-1.5 flex-shrink-0">
        {id === "robot" ? (
          <div className="overflow-hidden rounded-xl border bg-background mb-2 w-full h-[200px] relative">
            <RoboticsHeroCompact />
          </div>
        ) : image ? (
          <div className="overflow-hidden rounded-xl border bg-white mb-2 w-full h-[200px]">
            <img
              src={image}
              alt={`${title} 미리보기`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : null}
        <div className="flex items-center gap-2 mb-1">
          <div className="text-primary scale-90">{icon}</div>
          <span className="text-[10px] sm:text-xs font-medium text-accent uppercase tracking-wide">{level}</span>
        </div>
        <CardTitle className="font-heading text-sm sm:text-base md:text-lg leading-tight line-clamp-2 min-h-[2.5rem]">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base line-clamp-3 min-h-[3rem]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-1.5 flex-shrink-0">
        <p className="text-[10px] sm:text-xs md:text-xs text-muted-foreground">기간: {duration}</p>
      </CardContent>
      <CardFooter className="pt-2 mt-auto flex-shrink-0">
        <Link to={`/curriculum/${id}`} className="w-full">
          <Button variant="outline" className="w-full group text-xs sm:text-sm md:text-base py-2 sm:py-2.5">
            자세히 보기
            <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
