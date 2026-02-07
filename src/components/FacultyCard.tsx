import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface FacultyCardProps {
  name: string;
  title: string;
  expertise: string[];
  bio: string;
  email: string;
}

export const FacultyCard = ({ name, title, expertise, bio, email }: FacultyCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all hover-scale">
      <CardHeader>
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-4xl font-bold text-primary">
          {name.charAt(0)}
        </div>
        <CardTitle className="font-heading text-center">{name}</CardTitle>
        <CardDescription className="text-center">{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {expertise.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">{bio}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${email}`} className="hover:underline">
            {email}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
