import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PortfolioCardProps {
  title: string;
  student: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
}

export const PortfolioCard = ({ title, student, description, category, tags, image }: PortfolioCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center text-6xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">{image}</span>
        
        {/* Tags in top-left corner */}
        {tags && tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-primary/90 text-primary-foreground border-0 rounded-full px-3 py-1 text-xs font-medium shadow-lg"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            {category}
          </Badge>
        </div>
        <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
        <CardDescription className="text-xs">제작: {student}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
