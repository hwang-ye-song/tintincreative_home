import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CurriculumCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: React.ReactNode;
  image?: string;
}

export const CurriculumCard = ({ id, title, description, level, duration, icon, image }: CurriculumCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all hover-scale h-full flex flex-col min-h-[480px] w-full">
      <CardHeader className="space-y-2 pb-2 flex-shrink-0">
        {image && (
          <div className="overflow-hidden rounded-xl border bg-muted/40 mb-2 aspect-video w-full max-h-[180px]">
            <img
              src={image}
              alt={`${title} 미리보기`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-primary scale-90">{icon}</div>
          <span className="text-[10px] sm:text-xs font-medium text-accent uppercase tracking-wide">{level}</span>
        </div>
        <CardTitle className="font-heading text-base sm:text-lg md:text-xl leading-tight line-clamp-2 min-h-[3rem]">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base line-clamp-3 min-h-[3.5rem]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2 flex-shrink-0">
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">기간: {duration}</p>
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
