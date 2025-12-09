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
    <Card className="group hover:shadow-lg transition-all hover-scale h-full flex flex-col">
      <CardHeader className="space-y-3 sm:space-y-4 pb-3 sm:pb-4">
        {image && (
          <div className="overflow-hidden rounded-xl border bg-muted/40">
            <img
              src={image}
              alt={`${title} 미리보기`}
              className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="text-primary scale-75 sm:scale-100">{icon}</div>
          <span className="text-[10px] sm:text-xs font-medium text-accent uppercase tracking-wide">{level}</span>
        </div>
        <CardTitle className="font-heading text-base sm:text-lg md:text-xl leading-tight">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm md:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2 sm:pb-3">
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">기간: {duration}</p>
      </CardContent>
      <CardFooter className="pt-2 sm:pt-3 mt-auto">
        <Link to={`/curriculum/${id}`} className="w-full">
          <Button variant="outline" className="w-full group text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3">
            자세히 보기
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
