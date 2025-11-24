import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye } from "lucide-react";

interface PortfolioCardProps {
  id: string;
  title: string;
  student: string;
  description: string;
  category: string;
  tags: string[];
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
}

// Utility to strip HTML and get plain text preview
const getTextPreview = (html: string, maxLength: number = 150): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const PortfolioCard = ({ 
  id,
  title, 
  student, 
  description, 
  category, 
  tags, 
  commentCount = 0,
  likeCount = 0,
  viewCount = 0
}: PortfolioCardProps) => {
  const plainDescription = getTextPreview(description);
  const initials = student.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm p-4">
      <div className="flex gap-4">
        {/* Avatar on the left */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content in the middle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
          </div>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-primary/90 text-primary-foreground border-0 rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {plainDescription}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>제작: {student}</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {category}
            </Badge>
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">{viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            <span className="text-xs">{likeCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="text-xs">{commentCount}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
